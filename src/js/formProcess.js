let BOOKING_DATA = {};
let extention_status = false;

$(function(){
	// chrome.storage.sync.set({booking_data: {}});
	initApp();
	getBookingData(function(allSavedBookings){
		BOOKING_DATA = allSavedBookings || {};
	});

	let hash = $_GET('hash');
	if(null !== hash){
		console.log('Hash');
		renderPaymentBlock();
		getBookingData(renderFormWithData, hash);
	}else if($_GET('tab') == 'trips'){
		console.log('Trips');
		updatePendingView();
		$('.nav-tabs a[aria-controls="nav-pending"]').tab('show');
	}else if($_GET('tab') == 'new'){
		console.log('New');
		renderPaymentBlock();
		$('.nav-tabs a[aria-controls="nav-new"]').tab('show');
		// gaPage('/booking_form.html');
		$('#formName').focus();
	}
});

const initApp = function(){
	checkExtentionSwitch();
	$('.app-version').text('version - '+ chrome.app.getDetails().version);
	$('.app-name').text(chrome.app.getDetails().name);

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

	$('[data-field="p_age"]').on('keypress', function(e){
		return (e.charCode >= 48 && e.charCode <= 57);
	});

	$('[data-field="p_age"]').on('keyup',function(){
		let target = $(this).closest('tr').find('select:last');
		if(this.value >= 60){
			target.prop('disabled', false);
		}else{
			target.val(0).prop('disabled', true);
		}
	});

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

	$('#booking_form').submit(openAlertModel);
	$('#shortcut-note').on('click', checkHash);
	$('#finalSave').on('click', function(){
		let key = btoa($('#formName').val());
		updateBookingData(key, formJSON(), 'old');
		$('#confirmSave').modal('hide');
	});

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

	$('#coach_preferred').click(function(e){
		if(true === $(this).is(':checked')){
			$('#coach_preferred_no').removeAttr('readonly');
		}
		else{
			$('#coach_preferred_no').val('').attr('readonly', true);
		}
	});
}

const redirectTab = function(this_){
	window.location.href = './booking_form.html?tab='+$(this_.target).attr('aria-tab');
}

const resetPassengerRow = function(this_){
	if($(this_.target).closest('tr').find('th').length == 0){
		$(this_.target).closest('tr').find('input:text').val(''); // Name,Age
		$(this_.target).closest('tr').find('[data-field="p_gender"]').val('NONE');
		$(this_.target).closest('tr').find('[data-field="p_choice"]').val('NONE');
		$(this_.target).closest('tr').find('[data-field="p_food"]').val('V');
		$(this_.target).closest('tr').find('[data-field="p_bedroll"]').prop('checked', false);
		$(this_.target).closest('tr').find('td:nth-child(7) select').val(1).prop('disabled', true);
		// Child passenger
		$(this_.target).closest('tr').find('[data-field="age"]').val('NONE');
		$(this_.target).closest('tr').find('[data-field="gender"]').val('NONE');
	}else{
		$(this_.target).closest('table').find('input:text').val(''); // Name,Age
		$(this_.target).closest('table').find('[data-field="p_gender"]').val('NONE');
		$(this_.target).closest('table').find('[data-field="p_choice"]').val('NONE');
		$(this_.target).closest('table').find('[data-field="p_food"]').val('V');
		$(this_.target).closest('table').find('[data-field="p_bedroll"]').prop('checked', false);
		$(this_.target).closest('table').find('td:nth-child(7) select').val(1).prop('disabled', true);
		// Child passenger
		$(this_.target).closest('table').find('[data-field="age"]').val('NONE');
		$(this_.target).closest('table').find('[data-field="gender"]').val('NONE');
	}
}

const renderPaymentBlock = function(){
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

const renderPaymentBank = function(payment_mode){
	$('[name="bank_name"]').html('').append($('<option/>').html('Select Bank').val("NONE"));
	$.each(payment_bank_opt[payment_mode], function(k,v){
		$('[name="bank_name"]').append($('<option/>').html(v).val(v));
	});
}

const setExtentionStatus = function(status = 'OFF'){
	if(status === "ON"){
		chrome.storage.sync.set({extention_status: true}, function(){
			chrome.browserAction.setBadgeText({text: "ON"});
			$('#extention_status_booking').prop('checked', true);
			extention_status = true;
		});
	}else{
		chrome.storage.sync.set({extention_status: false}, function(){
			chrome.browserAction.setBadgeText({text: "OFF"});
			$('#extention_status_booking').prop('checked', false);
			extention_status = false;
		});
	}
}

const checkExtentionSwitch = function(){
	chrome.storage.sync.get(['extention_status'], function(result) {
		if(typeof result.extention_status != 'undefined')
			extention_status = result.extention_status;
		$('#extention_status_booking').prop('checked', extention_status);
		$('#extention_status_popup').prop('checked', extention_status);
		chrome.browserAction.setBadgeText({text: (true === extention_status) ? 'ON' : 'OFF'});
	});
}

const $_GET = function(key){
	let url = new URL(window.location.href);
	let c = url.searchParams.get(key);
	return (c == null || c == "")? null : c;
}

const updatePendingView = function(renderHash = null){
	$('#booking_card').html('');
	getBookingData(function(b_data){
		if(typeof b_data !== 'undefined' && Object.keys(b_data).length > 0){
			$.each(b_data, function(k,v){
				// console.log(v.booking_form_name);
				let html_temp = card_tmpl;
				console.log(v.j_date);
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
					quota: valid_quota[v.booking_quota]
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
				gaEvent("BOOKING_FORM", "clicked", "Booking Edit");
			});

			$('[data-action="delete"]').click(function(){
				if(true === extention_status){
					let hash = $(this).attr('data-hash');
					deleteBookingData(hash);
				}
			});

			$('[data-action="triggerBooking"]').click(function(){
				if(true === extention_status){
					let hash = $(this).attr('data-hash');
					getBookingData(function(booking_json){
						chrome.storage.sync.set({booking_active: booking_json});
						BOOKING_DATA['active'] = booking_json;
						console.log(booking_json);
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

const clearBookings = function(){
	$('#booking_card').append(
		$('<div/>').addClass('card card-body bg-light')
		.append($('<h1/>').text('No Booking Found').addClass('text-center'))
		.append($('<button/>').text('Create New Booking').addClass('btn btn-primary').attr({'id':"createNewBooking"}))
	);
	$('#createNewBooking').click(openBlankForm);
}

const getAvailableTrains = function(){
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

const openBlankForm = function(){
	// $('#nav-home-tab').tab('show');
	window.location.href = window.location.origin + window.location.pathname + '?tab=new';
}

const openAlertModel = function(){
	$('#note-alert').modal('show');
	return false;
}

const checkHash = function(){
	let key = btoa($('#formName').val());
	getBookingData(function(resp){
		// BOOKING_DATA = booking_data || {};
		if(typeof resp[key]!=='undefined'){
			$('#note-alert').modal('hide');
			$('#confirmSave').modal('show');
			return false;
		}else{
			updateBookingData(key, formJSON());
			$('#note-alert').modal('hide');
		}
	});
}

const deleteBookingData = function(key = null){
	if(key === null){
		return false;
	}else{
		getBookingData(function(resp){
			let last_node = (Object.keys(resp).length == 1)? true : false;
			delete resp[key];
			delete BOOKING_DATA[key];
			chrome.storage.sync.set({booking_data: resp}, function(){
				$('a[data-hash="'+ key +'"]').closest('.card').parent().remove();
				if(last_node)
					clearBookings();
			});
			gaEvent("BOOKING_FORM", "clicked", "Booking Delete");
		});
	}
}

const updateBookingData = function(key = null, formJson = null, type='new'){
	if(key === null || formJson === null){
		return false;
	}
	getBookingData(function(resp){
		BOOKING_DATA[key] = formJson;
		resp[key] = formJson;
		chrome.storage.sync.set({booking_data: resp}, function() {
			updatePendingView();
			if(type === 'old'){
				gaEvent("BOOKING_FORM", "clicked", "Booking Update");
			}else{
				gaEvent("BOOKING_FORM", "clicked", "Booking Save");
			}
			// $('button[type="reset"]').trigger('click');
			console.log(formJson);
			chrome.storage.sync.get(['booking_active'], function(active){
				if(key === btoa(active.booking_active.booking_form_name)){
					chrome.storage.sync.set({'booking_active': formJson}, function(){
						// chrome.storage.sync.get(['booking_active'], function(active){ console.log(active.booking_active);});
					});
				}else{
					console.log('not match');
				}
			});
			window.location.href = window.location.origin + window.location.pathname + '?tab=trips';
		});
	});


}

/*const saveBookingForm = function(){
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
			chrome.storage.sync.set({"booking_data": booking_data}, function() {
				// chrome.storage.sync.set({booking_default: booking_data[key]});
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
*/
const formJSON = function(){

	let	formJson = {
		"auto_upgradation": false,
		"auto_proceed": false,
		"confirm_berths": false,
		"coach_preferred": false,
		"seq_question": false,
		"psngr": {"C" :[], "A": []},
		// new format json
		/*"form": {
			"name": $('[name="booking_form_name"]').val(),
			 "comment": $('[name="booking_form_comment"]').val()
		},
		"login": {
			"username": $('[name="IRCTC_username"]').val(),
			"password": $('[name="IRCTC_pwd"]').val()
		},
		"jdetail": {
			"stn_from": $('[name="from_station"]').val(),
			"stn_to": $('[name="to_station"]').val(),
			"j_date": $('[name="j_date"]').val(),
			"train": $('[name="train"]').val(),
			"coach_class": $('[name="coach_class"]').val(),
			"booking_quota": $('[name="booking_quota"]').val(),
			"boarding_stn": $('[name="boarding_stn"]').val(),
			"mobile_no": $('[name="mobile_no"]').val(),
		},
		"passenger": {"A": [], "C": []},*/
	};
	let form_data = $('#booking_form').serializeArray();
	$.each(Object.keys(form_data), function(k,v){
		if(form_data[k].name === 'IRCTC_pwd')
			formJson[form_data[k].name] = encrypt(form_data[k].value, form_data[k].name);
		else if($.inArray(form_data[k].name, ["auto_upgradation", "confirm_berths"]) != -1)
			formJson[form_data[k].name] = $('[name="'+form_data[k].name+'"]').is(':checked');
		else if(form_data[k].name === 'coach_preferred')
			formJson[form_data[k].name] = $('[name="'+form_data[k].name+'"]').is(':checked') ;//? $('[name="coach_preferred_no"]').val() : false;
		else
			formJson[form_data[k].name] = form_data[k].value;
	});

	$('#pasenger-table tbody tr').each(function(k, tr){
		let temp = {
			name: $(tr).find('[data-field="p_name"]').val(),
			age: $(tr).find('[data-field="p_age"]').val(),
			gender: $(tr).find('[data-field="p_gender"]').val(),
			berth: $(tr).find('[data-field="p_choice"]').val(),
			food: $(tr).find('[data-field="p_food"]').val(),
			bedroll: $(tr).find('[data-field="p_bedroll"]').is(':checked'),
			scitizon: $(tr).find('[data-field="p_senior"]').val(),
			opt_berth: $(tr).find('[data-field="opt_berth"]').is(':checked'),
		};
		if(temp.name && temp.age && temp.gender !== 'NONE')
			formJson.psngr.A.push(temp);
	});

	$('#pasenger-child-table tbody tr').each(function(k, tr){
		let temp = {
			name: $(tr).find('[data-field="p_name"]').val(),
			age: $(tr).find('[data-field="age"]').val(),
			gender: $(tr).find('[data-field="gender"]').val()
		};
		if(temp.name && temp.age && temp.gender !== 'NONE')
			formJson.psngr.C.push(temp);
	});

	if($('#enable_sq').is(":checked") === true){
		formJson.seq_question = {};
		$('#seq_card input:text').each(function(k,v){
			formJson.seq_question[$(this).attr('data-field')] = $(this).val();
		});
		formJson.seq_question[$('#seq_card input[type="email"]').attr('data-field')] = $('#seq_card input[type="email"]').val();
		formJson.seq_question[$('#seq_card input:radio:checked').attr('name')] = $('#seq_card input:radio:checked').val();
	}
	delete formJson['ewallet'];
	return formJson;
}

const getBookingData = function(callback = false, key = false){
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

const renderFormWithData = function(json){
	$('[type="reset"]').trigger('click');
	console.log(json);
	$.each(json, function(k,v){
		if(k == 'psngr'){
			v.A.forEach(fillPassengerA);
			v.C.forEach(fillPassengerC);
		}else if(-1 != $.inArray(k, checkBox)){
			$('[name="'+k+'"]').attr({'checked': v});
		}else if(-1 != $.inArray(k, radioBox)){
			$('[name="'+k+'"][value="'+v+'"]').attr({'checked': true});
		}else if(k === 'IRCTC_pwd'){
			$('[name="'+ k + '"]').val(decrypt(v, k));
		}else if(k === 'insurance_choice'){
			(v === 'YES') ? $('#insuranceY').prop('checked', true) : $('#insuranceN').prop('checked', true);
		}else{
			$('[name="'+ k + '"]').val(v);
		}
		if(k == 'pay_mod'){
			renderPaymentBank(v);
			$('[name="bank_name"]').val(json.bank_name);
		}


		if(k === 'seq_question' && v !== false){
			$('[data-field="dob"]').val(v.dob);
			$('[data-field="login_id"]').val(v.login_id);
			$('[data-field="email_id"]').val(v.email_id);
			$('[data-field="mob_no"]').val(v.mob_no);
			$('[data-field="ewallet"][value="'+v.ewallet+'"]').prop('checked', true);
			$('#enable_sq').prop('checked', true);
		}else if(k === 'seq_question' && v === false){
			$('#enable_sq').prop('checked', false);
		}
	});
	// $('[href="#nav-new"]').trigger('click');
}

let fill_PA_index = 0;
let fill_CA_index = 0;
const fillPassengerA = function(record){
	if(fill_PA_index < 6){
		let target = $('#pasenger-table tbody tr:eq('+fill_PA_index+')');
		target.find('[data-field="p_name"]').val(record.name);
		target.find('[data-field="p_age"]').val(record.age);
		target.find('[data-field="p_gender"]').val(record.gender);
		target.find('[data-field="p_choice"]').val(record.berth);
		target.find('[data-field="p_food"]').val(record.food);
		target.find('[data-field="p_bedroll"]').prop('checked', (record.bedroll) ? true : false);
		if(record.age >= 60){
			target.find('[data-field="p_senior"]').removeAttr('disabled').val(record.scitizon);
		}
		fill_PA_index++;
	}
}

const fillPassengerC = function(record){
	if(fill_CA_index < 2){
		let target = $('#pasenger-child-table tbody tr:eq('+fill_CA_index+')');
		target.find('[data-field="p_name"]').val(record.name);
		target.find('[data-field="age"]').val(record.age);
		target.find('[data-field="gender"]').val(record.gender);
		fill_CA_index++;
	}
}

/*const encrypt = function(value, key=null){
	return CryptoJS.AES.encrypt(value, STORAGE_KEY_PREFIX + "-" +key).toString();
}

const decrypt = function(value, key=null){
	return CryptoJS.AES.decrypt(value, STORAGE_KEY_PREFIX + "-" +key).toString(CryptoJS.enc.Utf8);
}*/

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
	if("Extention OFF" === message){
		setExtentionStatus('OFF');
	}else if("Extention ON" === message){
		setExtentionStatus('ON');
	}else if("closeTab" === message){
		console.log(message);
		console.log(sender);
		console.log(sendResponse);
	}
});




