
var extention_status = false;

$(function(){
	// chrome.storage.sync.set({booking_data: {}});
	let hash = $_GET('hash');
	initApp();
	renderPaymentBlock();
	updatePendingView();
	checkExtentionSwitch();

	if(null !== hash){
		console.log('hash');
		// $.toast("Now you can edit existing form");
		getBookingData(renderFormWithData, hash);
	}else if($_GET('tab') == 'trips'){
		console.log('Trips');
		$('.nav-tabs a[aria-controls="nav-pending"]').tab('show');
	}else if($_GET('tab') == 'new'){
		console.log('New');
		$('.nav-tabs a[aria-controls="nav-new"]').tab('show');
		// gaPage('/booking_form.html');
		// $('#formName').focus();
	}
});

function initApp(){
	$('.app-version').text('version - '+ chrome.app.getDetails().version);

	$('#nav-home-tab, #nav-pending-tab').on('click', redirectTab);

	for(let i=1; i<=6; i++){
		let r = passenger_row.replace('{{pcount}}', i);
		$('#pasenger-table tbody').append(r);
	}

	for(let j=1; j<=2; j++){
		let r = child_passenger_row.replace('{{pcount}}', j);
		$('#pasenger-child-table tbody').append(r);
	}

	$('#pasenger-table span[data-action="reset_row"],#pasenger-child-table span[data-action="reset_row"]').on('click', resetPassengerRow);


	$('#extention_status_booking').click(function(){
		if($(this).is(':checked') === true){
			setExtentionStatus('ON');
			gaEvent("BOOKING_FORM", "clicked", "Extention ON");
		}else{
			setExtentionStatus('OFF');
			gaEvent("BOOKING_FORM", "clicked", "Extention OFF");
		}
	});

	$('[data-action="switchjd"]').click(function(){
		let s_stn = $('[name="from_station"]').val();
		let d_stn = $('[name="to_station"]').val();
		$('[name="from_station"]').val(d_stn);
		$('[name="to_station"]').val(s_stn);
	});
}

function redirectTab(this_){
	window.location.href = './booking_form.html?tab='+$(this_.target).attr('aria-tab');
}


function resetPassengerRow(this_){
	if($(this_.target).closest('tr').find('th').length == 0){
		$(this_.target).closest('tr').find('input:text').val(''); // Name,Age
		$(this_.target).closest('tr').find('[data-field="p_gender"]').val('NONE');
		$(this_.target).closest('tr').find('[data-field="p_choice"]').val('NONE');
		$(this_.target).closest('tr').find('[data-field="p_food"]').val('V');
		$(this_.target).closest('tr').find('[data-field="p_bedroll"]').prop('checked', false);
		// Child passenger
		$(this_.target).closest('tr').find('[data-field="age"]').val('NONE');
		$(this_.target).closest('tr').find('[data-field="gender"]').val('NONE');
	}else{
		$(this_.target).closest('table').find('input:text').val(''); // Name,Age
		$(this_.target).closest('table').find('[data-field="p_gender"]').val('NONE');
		$(this_.target).closest('table').find('[data-field="p_choice"]').val('NONE');
		$(this_.target).closest('table').find('[data-field="p_food"]').val('V');
		$(this_.target).closest('table').find('[data-field="p_bedroll"]').prop('checked', false);
		// Child passenger
		$(this_.target).closest('table').find('[data-field="age"]').val('NONE');
		$(this_.target).closest('table').find('[data-field="gender"]').val('NONE');
	}
}

function renderPaymentBlock(){
	$('#payment-method-radio').html('');
	$.each(payment_opt, function(pc, ptext){
		// time_now = (new Date()).getTime();
		let input_radio = $('<input/>').addClass('form-check-input').attr({
			'type': "radio",
			"name": "pay_mod",
			"id": "pay_mod_"+pc,
			"value": pc,
		});

		let radio_label = $('<label/>').addClass('form-check-label').attr({
			"for": "pay_mod_"+pc
		}).text(ptext);
		// console.log(['Inarray = ',$.inArray(pc, permit_payment)]);
		if(-1 == $.inArray(pc, permit_payment)){
			return true;
			input_radio.prop('disabled', true);
			radio_label.addClass('text-muted');
		}else{
			radio_label.addClass('text-success font-weight-bold');
		}

		let p_opt = $('<div/>').addClass('form-check disabled')
		.append(input_radio)
		.append(radio_label);

		$('#payment-method-radio').append(p_opt);
	});

	$('[name="pay_mod"]').click(function(){
		renderPaymentBank(this.value);
	});
}

function renderPaymentBank(payment_mode){
	$('[name="bank_name"]').html('').append($('<option/>').html('Select Bank').val("NONE"));
	$.each(payment_bank_opt[payment_mode], function(k,v){
		$('[name="bank_name"]').append($('<option/>').html(v).val(v));
	});
}

function setExtentionStatus(status = 'OFF'){
	if(status === "ON"){
		chrome.storage.sync.set({extention_status: true}, function(){
			chrome.browserAction.setBadgeText({text: "ON"});
			extention_status = true;
		});
	}else{
		chrome.storage.sync.set({extention_status: false}, function(){
			chrome.browserAction.setBadgeText({text: "OFF"});
			extention_status = false;
		});
	}
}

function checkExtentionSwitch(){
	chrome.storage.sync.get(['extention_status'], function(result) {
		if(typeof result.extention_status != 'undefined')
			extention_status = result.extention_status;
		$('#extention_status_booking').prop('checked', extention_status);
		$('#extention_status_popup').prop('checked', extention_status);
		chrome.browserAction.setBadgeText({text: (true === extention_status) ? 'ON' : 'OFF'});
	});
}

function $_GET(key){
	let url = new URL(window.location.href);
	let c = url.searchParams.get(key);
	return (c == null || c == "")? null : c;
}

function updatePendingView(renderHash = null){
	$('#booking_card').html('');
	getBookingData(function(b_data){
		if(typeof b_data !== 'undefined' && Object.keys(b_data).length > 0){
			console.log(b_data);
			$.each(b_data, function(k,v){
				// console.log(v.booking_form_name);
				let html_temp = card_tmpl;
				jd_parts = v.j_date.split('-');
				let temp = {
					hash: k,
					form_name: v.booking_form_name,
					from: ((v.from_station || '-').split('-')[1]).trim(),
					to: ((v.to_station || '-').split('-')[1]).trim(),
					train_no: v.train.split(":")[0],
					train_name: v.train.split(":")[1],
					j_date: v.j_date,
					j_day: weeks[new Date(jd_parts[0] + " " + M_to_month[parseInt(jd_parts[1]) - 1]+ " " + jd_parts[2]).getDay()],
					psgn_count: v.psngr.A.length,
					psgn_ch_count: v.psngr.C.length,
					class:v.coach_class,
					quota: quota[v.booking_quota]
				};

				$.each(temp, function(k,v){
					let pattern = '{{' + k + '}}';
					let regEx = new RegExp(pattern, 'g');
					html_temp = html_temp.replace(regEx, v);
				});

				$('#booking_card').append(html_temp);
			});

			$('[data-action="edit"]').click(function(){
				if(true === extention_status){
					let hash = $(this).attr('data-hash');
					window.location.href = window.location.origin + window.location.pathname + "?hash=" + hash;
				}
				// getBookingData(renderFormWithData, hash);
				gaEvent("BOOKING_FORM", "clicked", "Booking Edit");
			});

			$('[data-action="delete"]').click(function(){
				if(true === extention_status){
					let hash = $(this).attr('data-hash');
					this_ = this;
					getBookingData(function(resp){
						let last_node = (Object.keys(resp).length == 1)? true : false;
						delete resp[hash];
						chrome.storage.sync.get(['booking_default'], function(result) {
							let updateJson = {"booking_data": resp};
							if(hash == btoa(result.booking_default.booking_form_name)){
								let keys = Object.keys(resp);
								defaultJson = null;
								if(keys.length > 0){
									active_hash = keys[keys.length - 1];
									updateJson.booking_default = resp[active_hash];
								}
							}
							chrome.storage.sync.set(updateJson, function(){
								$(this_).closest('.card').parent().remove();
								if(last_node)
									clearBookings();
							});
						});
					});
					gaEvent("BOOKING_FORM", "clicked", "Booking Delete");
				}
			});

			$('[data-action="triggerBooking"]').click(function(){
				if(true === extention_status){
					let hash = $(this).attr('data-hash');

					getBookingData(function(booking_json){
						console.log(booking_json);
						chrome.storage.sync.set({booking_default: booking_json});
						chrome.tabs.create({
							url:'https://www.irctc.co.in/nget/train-search',
							active: true
						});
					}, hash);

					gaEvent("BOOKING_FORM", "clicked", "Booking Trigger");
				}
			});
		}
		else{
			clearBookings();
		}
	});
}

function clearBookings(){
	$('#booking_card').append(
		$('<div/>').addClass('card card-body bg-light')
		.append($('<h1/>').text('No Booking Found').addClass('text-center'))
		.append($('<button/>').text('Create New Booking').addClass('btn btn-primary').attr({'id':"createNewBooking"}))
	);
	$('#createNewBooking').click(openBlankForm);
}

// $('[name="from_station"],[name="to_station"]').change(getAvailableTrains);

function getAvailableTrains(){
	let stn1 = $('[name="from_station"]').val();//.split('-')[1].trim();
	let stn2 = $('[name="to_station"]').val();//.split('-')[1].trim();
	console.log(stn1);
	console.log(stn2);
	if(stn1!== "" && stn2 !== ""){
		$.ajax({
			type: 'GET',
			url: 'https://erail.in/rail/getTrains.aspx?Station_From=GAYA&Station_To=PNBE&Cache=true',
			// data: {'stn1': stn1,'stn2':stn2},
			dataType: 'JSONP',
			// crossDomain : true,
			success: function(resp){
				console.log(resp);
			},
			eror: function(xhr){
				console.log(xhr);
			}
		});
	}
}

function openBlankForm(){
	$('#nav-home-tab').tab('show');
}

$(".station").autocomplete({
	max:10,
	minLength:2,
	source: availableStations_en
});

$(".train").autocomplete({
	max:10,
	minLength:2,
	source: availableTrains_en
});

$('#j_date').datepicker({
	uiLibrary: 'bootstrap4',
	minDate: "-0D",
	maxDate: "+3M",
	dateFormat: 'dd-mm-yy'
});

$('.calender').click(function(){
	$(this).prev().focus();
});

$('#booking_form').submit(openAlertModel);
$('#finalSave').on('click',saveBookingForm);

function openAlertModel(){
	$('#note-alert').modal('show');
	return false;
}

function saveBookingForm(){
	let key = btoa($('#formName').val());
	$('#note-alert').modal('hide');
	getBookingData(function(booking_data){
		booking_data = booking_data || {};
		let status=true;
		let old = false;
		if(typeof booking_data[key]!=='undefined'){
			old = true;
			status = confirm('Form Name already present. Do you want to update?');
		}
		if(status === true){
			booking_data[key] = formJSON();
			// console.log(booking_data[key]);
			chrome.storage.sync.set({booking_data: booking_data}, function() {
				/*$('#msgBox').show();
				$('#msgBox').alert();*/
				chrome.storage.sync.set({booking_default: booking_data[key]});
				// alert('Your Form successfully saved with "'+ $('#formName').val() +'"');
				$.toast({
					heading: 'Form Save',
					text: 'Your Form successfully saved with <strong>'+ $('#formName').val() +'</strong>',
					position: 'bottom-right',
					stack: false
				});
				updatePendingView();
				$('button[type="reset"]').trigger('click');
				$('[href="#nav-pending"]').tab('show');
			});
		}
		if(old){
			gaEvent("BOOKING_FORM", "clicked", "Booking Update");
		}else{
			gaEvent("BOOKING_FORM", "clicked", "Booking Save");
		}
	});
	return false;
}

function formJSON(){
	let form_data = $('#booking_form').serializeArray();
	let	formJson = {
		"auto_upgradation": false,
		"auto_proceed": false,
		"confirm_berths": false,
		"coach_preferred": false,
		"seq_question": false,
		"psngr": {"C" :[], "A": []}
	};

	$.each(form_data, function(k,v){
		if($.inArray(v.name, ['dob','email_id','mob_no','login_id','ewallet']) !== -1){
			return true;
		}
		let psgn_ch_match = (v.name).match(new RegExp(/^(psgn_ch)(\[)([\d])(\])(\[\')([a-z]+)(\'\])$/i));
		if(null !== psgn_ch_match && v.value != ''){
			if(typeof formJson['psngr']['C'][psgn_ch_match[3]] == 'undefined'){
				formJson['psngr']['C'][psgn_ch_match[3]] = {"name": "", "age" : "", "gender" : ""};
			}
			if(v.value != ''){
				formJson['psngr']['C'][psgn_ch_match[3]][psgn_ch_match[6]] = v.value;
			}else{
				delete formJson['psngr']['C'][psgn_ch_match[3]];
			}
		}else{
			let psgn_match = (v.name).match(new RegExp(/^(psgn)(\[)([\d])(\])(\[\')([a-z]+)(\'\])$/i));
			if(null !== psgn_match && v.value != ''){
				if(typeof formJson['psngr']['A'][psgn_match[3]] == 'undefined'){
					formJson['psngr']['A'][psgn_match[3]] = {"name": "", "age" : "", "gender" : "", "choice":""};
				}
				if(v.value != ''){
					formJson['psngr']['A'][psgn_match[3]][psgn_match[6]] = v.value;
				}else{
					delete formJson['psngr']['A'][psgn_match[3]];
				}
			}else if(-1 != $.inArray(v.name , checkBox) && 'on' == v.value){
				formJson[v.name] = true;

			}else if(null == psgn_match && null == psgn_ch_match){
				formJson[v.name] = v.value;
			}
		}
	});

	if($('#enable_sq').is(":checked") === true){
		formJson.seq_question = {};
		$('#seq_card input:text').each(function(k,v){
			formJson.seq_question[$(this).attr('name')] = $(this).val();
		});
		formJson.seq_question[$('#seq_card input[type="email"]').attr('name')] = $('#seq_card input[type="email"]').val();
		formJson.seq_question[$('#seq_card input:radio:checked').attr('name')] = $('#seq_card input:radio:checked').val();
	}

	return formJson;
}

function getBookingData(callback = false, key = false){
	chrome.storage.sync.get(['booking_data'], function(result) {
		var data = null;
		if(key !== false){
			data = result.booking_data[key];
		}else{
			data = result.booking_data;
		}
		if(callback !== false && data !== null){
			callback(data)
		}
	});
}

function renderFormWithData(json){
	$('[type="reset"]').trigger('click');
	console.log(json);
	$.each(json, function(k,v){
		if(k == 'psngr'){
			$.each(v, function(pk,pr){
				type = (pk == 'C') ? '_ch' : '';
				$.each(pr, function(x, r){
					$.each(r, function(rx, rc){
						// console.log(`[name="psgn`+ type +`[` + x + `]['` + rx + `']"]`);
						$(`[name="psgn`+ type +`[` + x + `]['` + rx + `']"]`).val(rc);
					});
				});
			});
		}else if(-1 != $.inArray(k, checkBox)){
			if(true == v){
				$('[name="'+k+'"]').attr({'checked': true});
			}
		}else if(-1 != $.inArray(k, radioBox)){
			// console.log('[name="'+k+'"] [value="'+v+'"]');
			$('[name="'+k+'"][value="'+v+'"]').attr({'checked': true});
		}else{
			$('[name="'+ k + '"]').val(v);
		}

		if(k == 'pay_mod'){
			renderPaymentBank(v);
			$('[name="bank_name"]').val(json.bank_name);
		}

		if(k === 'seq_question' && v !== false){
			$('#enable_sq').prop('checked', true);
			$('[name="dob"]').val(v.dob);
			$('[name="login_id"]').val(v.login_id);
			$('[name="email_id"]').val(v.email_id);
			$('[name="mob_no"]').val(v.mob_no);
			$('[name="ewallet"][value="'+v.ewallet+'"]').prop('checked', true);
		}
	});
	// $('[href="#nav-new"]').trigger('click');
}

$('#coach_preferred').click(function(e){
	if(true === $(this).is(':checked')){
		$('#coach_preferred_no').removeAttr('readonly');
	}
	else{
		$('#coach_preferred_no').attr('readonly', true);
	}
});



