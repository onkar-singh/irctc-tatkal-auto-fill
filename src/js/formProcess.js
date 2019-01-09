
var extention_status = false;

$(function(){
	$('#app_version').text('version - 0.1.3');
	renderPaymentBlock();
	updatePendingView();
	hash = $_GET('hash');
	$('#extention_status_booking').click(function(){
		if($(this).is(':checked') === true){
			setExtentionStatus('ON');
			gaEvent("BOOKING_FORM", "clicked", "Extention ON");
		}else{
			setExtentionStatus('OFF');
			gaEvent("BOOKING_FORM", "clicked", "Extention OFF");
		}
	});
	checkExtentionSwitch();
	if(null !== hash){
		$.toast("Now you can edit existing form");
		getBookingData(renderFormWithData, $_GET('hash'));
	}

	gaPage('/booking_form.html');

	$('#formName').focus();
})

function renderPaymentBlock(){
	$('#payment-method-radio').html('');
	$.each(payment_opt, function(pc, ptext){
		// time_now = (new Date()).getTime();
		input_radio = $('<input/>').addClass('form-check-input').attr({
			'type': "radio",
			"name": "pay_mod",
			"id": "pay_mod_"+pc,
			"value": pc,
		});

		radio_label = $('<label/>').addClass('form-check-label').attr({
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

		p_opt = $('<div/>').addClass('form-check disabled')
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
	// if($('#extention_status').is(':checked') === true)
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
	var url = new URL(window.location.href);
	var c = url.searchParams.get(key);
	return c;
}

function updatePendingView(renderHash = null){
	$('#booking_card').html('');
	getBookingData(function(b_data){
		if(typeof b_data !== 'undefined' && Object.keys(b_data).length > 0){
			// console.log(b_data);
			$.each(b_data, function(k,v){
				// console.log(v.booking_form_name);
				html_temp = card_tmpl;
				jd_parts = v.j_date.split('-');
				temp = {
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
					pattern = '{{' + k + '}}';
					regEx = new RegExp(pattern, 'g');
					html_temp = html_temp.replace(regEx, v);
				});

				$('#booking_card').append(html_temp);
			});

			$('[data-action="edit"]').click(function(){
				if(true === extention_status){
					hash = $(this).attr('data-hash');
					window.location.href = window.location.origin + window.location.pathname + "?hash=" + hash;
				}
				// getBookingData(renderFormWithData, hash);
				gaEvent("BOOKING_FORM", "clicked", "Booking Edit");
			});

			$('[data-action="delete"]').click(function(){
				if(true === extention_status){
					hash = $(this).attr('data-hash');
					this_ = this;
					getBookingData(function(resp){
						last_node = (Object.keys(resp).length == 1)? true : false;
						delete resp[hash];
						chrome.storage.sync.get(['booking_default'], function(result) {
							updateJson = {"booking_data": resp};
							if(hash == btoa(result.booking_default.booking_form_name)){
								keys = Object.keys(resp);
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
					hash = $(this).attr('data-hash');
					getBookingData(function(booking_json){
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

$('#booking_form').submit(saveBookingForm);

function saveBookingForm(){
	// $('#confirmSave').modal('show');
	// return false;
	key = btoa($('#formName').val());
	getBookingData(function(booking_data){
		booking_data = booking_data || {};
		var status=true;
		var old = false;
		if(typeof booking_data[key]!=='undefined'){
			//take user consent to proceed overriding data
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
	var form_data = $('#booking_form').serializeArray();
	var	formJson = {
		"auto_upgradation": false,
		"auto_proceed": false,
		"confirm_berths": false,
		"coach_preferred": false,
		"psngr": {"C" :[], "A": []}
	};
	$.each(form_data, function(k,v){
		psgn_ch_match = (v.name).match(new RegExp(/^(psgn_ch)(\[)([\d])(\])(\[\')([a-z]+)(\'\])$/i));
		if(null !== psgn_ch_match && v.value != ''){
			if(typeof formJson['psngr']['C'][psgn_ch_match[3]] == 'undefined'){
				formJson['psngr']['C'][psgn_ch_match[3]] = {"name": "", "age" : "", "gender" : ""};
			}
			if(v.value != ''){
				formJson['psngr']['C'][psgn_ch_match[3]][psgn_ch_match[6]] = v.value;
			}else{
				delete formJson['psngr']['C'][psgn_ch_match[3]];
			}
		}
		else{
			/*console.log([
				v.name,
				v.value,
				$.inArray(v.name,options),
				'on' == v.value
			]);*/
			psgn_match = (v.name).match(new RegExp(/^(psgn)(\[)([\d])(\])(\[\')([a-z]+)(\'\])$/i));
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
				// console.log(v.name+"="+v.value);
				formJson[v.name] = v.value;
			}
		}
	});

	// console.log('Form Json = ');
	// console.log(formJson);
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
	});
	$('[href="#nav-new"]').trigger('click');
}

$('#coach_preferred').click(function(e){
	if(true === $(this).is(':checked')){
		$('#coach_preferred_no').removeAttr('readonly');
	}
	else{
		$('#coach_preferred_no').attr('readonly', true);
	}
});



