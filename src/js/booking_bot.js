
var booking_data = {};
var loop = 0;
var watcher = false;

document.body.onload = function(){
	chrome.storage.sync.get(['extention_status'], function(result) {
		if(typeof result.extention_status != 'undefined')
			watcher = result.extention_status;
		if(true === watcher){
			chrome.storage.sync.get(['booking_default'], function(result) {
				hours = (new Date()).getHours();
				booking_data = result.booking_default;
				if(((booking_data.booking_quota == 'TK' || booking_data.booking_quota == 'PT') && (hours == 10 || hours == 11)) || (booking_data.booking_quota != 'TK' && hours != 10 && hours != 11)){
					fillSearchDetail();
					watcher == true;
					$.toast("Booking Started you need to <strong>click</strong> only three palce and two captcha");
					waitLoop();
				}else{
					$.toast("Booking Can't Started because it's Tatkal Time and you are tring to book General ticke. please try after tatkal time.");
				}
				// $('body').append($('<div/>').html(popup));
				// gaEvent("IRCTC_STATE", "clicked", "Bot Initiated");
			});
		}
	});
};


document.onkeyup = function(e) {
	if (e.which == 120) {
		// console.log(booking_data);
		waitLoop();
	}
};

function detectStep(){
	url_now = document.location.href;
	if(url_now === STEP1_URL){
		if(true === $('#loginText').is(":visible")){
			if(true === $('app-login').is(':visible')){
				if($('#userId').val() == "" || $('#pwd').val() == "")
					return 'login-fill';	// login-fill
				else
					return 'login-wait';	//login-wait
			}else{
				return 'login-open'; 	// login-open
			}
		}else{
			// if($('.h_head1 span'))
			if($('.h_head1 span:contains("Welcome")').length > 0){
				if($('[placeholder="From*"]').val() == "" || $('[placeholder="To*"]').val() == "" || $("input[placeholder='Journey Date(dd-mm-yyyy)*']").val() == ""){
					return 'fill-search';
				}else{
					return 'search-btn-trigger';
				}
			}
		}
	}else if(url_now === STEP2_URL){
		// set-quota
		quota_rexEx = new RegExp(valid_quota[booking_data.booking_quota]);
		q = $('.search_div label').html();
		quota = q;
		if(false === quota_rexEx.test(quota))
			return 'set-quota';
		else{
			if($('.train_avl_enq_box[selected-train="true"]').length == 0){
				return 'select-train';
			}else{
				// match coach class
				class_select = document.querySelectorAll('.train_avl_enq_box[selected-train="true"] [formcontrolname="classInput"]')[0];
				c_class = class_select.value;
				class_regEx = new RegExp(booking_data.coach_class);
				if(false == class_regEx.test(c_class)){
					return 'select-coach-class';
				}
				else{
					buttons = document.querySelectorAll('.train_avl_enq_box[selected-train="true"] button');
					if(buttons.length == 1 && buttons[0].innerText == "Check availability & fare"){
						return 'check-availability-btn-trigger';
					}
					else{
						return 'book-now-btn-trigger';
					}
				}
			}
		}
	}else if(url_now === STEP3_URL){
		if(document.querySelectorAll('.stepwizard-step[passenger-info="filled"]').length == 0){
			return 'fill-passenger';
		}else{
			return 'wait-passenger-captcha';
		}
	}else if(url_now === STEP4_URL){
		return 'wait-review';
	}else if(url_now === STEP5_URL){
		if(document.querySelectorAll('.stepwizard-step[payment-method="selected"]').length == 0){
			return 'select-payment-method';
		}else{
			header = document.querySelectorAll('.stepwizard-step[payment-method="selected"]')[0].attributes['selected-header'].value;
			payment_banks = document.querySelectorAll('p-tabpanel #'+header)[0].querySelectorAll('.payment_box');
			if(booking_data.bank_name == 'NONE'){
				return 'user-bank-not-found';
			}
			user_bank = booking_data.bank_name.trim().toLowerCase();
			// console.log(user_bank);
			bank_regEx = new RegExp(user_bank);
			// console.log(payment_banks);
			// console.log(bank_regEx);
			var available_bank = [];
			for(var i=0; i < payment_banks.length; i++){
				bank_name = payment_banks[i].querySelectorAll('label')[0].innerText.toLowerCase();
				available_bank.push(bank_name);
				if(true == bank_regEx.test(bank_name)){
					if(false == payment_banks[i].querySelectorAll('input')[0].checked){
						return 'select-payment-bank';
					}
				}
			}
			if(-1 == $.inArray(user_bank, available_bank)){
				return 'user-bank-not-found';
			}else{
				return 'make-payment-btn-trigger';
			}

		}
		// TODO: select-payment-opt
		// TODO: select-bank
		// TODO: pay-now
	}else{
		// TODO: need to auto-fill payment credential on bank site
		return 'unknown';
	}
}


// TODO: fill userid and pass then trigger login popup
function fillLogin(){
	userId = document.getElementById("userId");
	pwd = document.getElementById("pwd");

	userId.value = booking_data.IRCTC_username;
	userId.dispatchEvent(new Event('input'));

	pwd.value = booking_data.IRCTC_pwd;
	pwd.dispatchEvent(new Event('input'));

	document.getElementById("loginText").click();
	$.toast("Opening Login Window");
}

// TODO: fill search detail
function fillSearchDetail(){
	// fromStation = document.querySelectorAll("[placeholder='From*']")[0];
	// toStation = document.querySelectorAll("[placeholder='To*']")[0];
	fromStation = document.querySelectorAll("p-autocomplete[id='origin']")[0].querySelectorAll('input')[0];
	toStation = document.querySelectorAll("p-autocomplete[id='destination']")[0].querySelectorAll('input')[0];
	journeydate = document.querySelectorAll("[placeholder='Journey Date(dd-mm-yyyy)*']")[1];
	classCaret = document.getElementById('journeyClass').querySelectorAll('.fa-caret-down')[0];

	// fromStation.value = booking_data.from_station;
	fromStation.value = booking_data.from_station;
	fromStation.dispatchEvent(new Event('keydown'));
	fromStation.dispatchEvent(new Event('input'));

	toStation.value = booking_data.to_station;
	// toStation.value = "GAYA JN - GAYA";
	toStation.dispatchEvent(new Event('keydown'));
	toStation.dispatchEvent(new Event('input'));
	toStation.click();

	journeydate.value = booking_data.j_date;
	journeydate.dispatchEvent(new Event('keydown'));
	journeydate.dispatchEvent(new Event('input'));

	classCaret.click();
	// class_list  = ["EA","1A","2A","3A","EC","FC","3E","CC","SL","2S"];
	$("#journeyClass span:contains('"+ booking_data.coach_class +"')").parent().trigger('click');
	// searchSubmit.click();
	$.toast('Journey Detail Filled', "SUCCESS");
	// gaEvent("IRCTC_STATE", "clicked", "journey detail filled");
}

function triggerSearchBtn(){
	if(true === booking_data.auto_proceed){
		// searchSubmit = document.querySelectorAll('[type="submit"]')[3];
		searchSubmit = document.querySelectorAll('[type="submit"][label="Find Trains"]')[0];
		searchSubmit.click();
		$.toast("Journey Search done");
		// gaEvent("IRCTC_STATE", "clicked", "journey detail proceed");
	}else{
		$.toast('Proceed Manually [Search Journey]');
		// console.log('Proceed Manually [Search Journey]');
	}
}

function selectQuota(){
	search_quota_div = document.querySelectorAll('.search_div')[0];
	search_quota_div.querySelectorAll('.ui-dropdown-trigger')[0].click();
	quota_item = search_quota_div.querySelectorAll('.ui-dropdown-item');
	regEx_quota = new RegExp(valid_quota[booking_data.booking_quota]);
	for(var i=0; i<quota_item.length; i++){
		// console.log(quota_item[i]);
		// console.log(quota_item[i].outerHTML);
		if(regEx_quota.test(quota_item[i].outerHTML)){
			quota_item[i].click();
			$.toast("Quota Selected", "SUCCESS");
			// gaEvent("IRCTC_STATE", "clicked", "quota selected");
			break;
		}
	}
}

// TODO: fill train-list
function selectTrainCard(){
	// Select Train form list
	var availableTrains = $('.train_avl_enq_box');
	var train_no = (booking_data.train.split(":")[0]).trim();
	let regEx_TrainNo = new RegExp('\('+ train_no +'\)');
	var train_match_at = false;
	$.each(availableTrains, function(k, v){
		if(regEx_TrainNo.test(v.innerText)){
			// console.log("Found at - " + k);
			train_match_at = k;
			return true;
		}
	});
	// Modify default Design to target train list.
	if(train_match_at || train_match_at == 0){
		target_train_list = (availableTrains[train_match_at]);
		target_train_list.style = "background-color:yellow !important;border-color:#3C4637 !important;";
		target_train_list.setAttribute('selected-train', true);
		$.toast("Target Train Found");
		// gaEvent("IRCTC_STATE", "clicked", "train selected");
	}
}

function selectCoachClass(){
	class_select = document.querySelectorAll('.train_avl_enq_box[selected-train="true"] [formcontrolname="classInput"]')[0];
	regEx_class = new RegExp('\('+ booking_data.coach_class +'\)');
	$.each(class_select.children, function(k,v){
		if(regEx_class.test(v.innerHTML)){
			class_select.value = v.value;
			class_select.dispatchEvent(new Event('change'));
			$.toast("Coach Selected", "SUCCESS");
			return false;
		}
	});
}

function triggerAvailBtn(){
	if(true === booking_data.auto_proceed){
		document.querySelectorAll('.train_avl_enq_box[selected-train="true"] button')[0].click();
		$.toast("Checking Availability..");
	}else{
		// console.log('Proceed Manually [Check Availability]');
		$.toast("Proceed Manually [Check Availability]");
	}
}

function triggerBookNowBtn(){
	if(true === booking_data.auto_proceed){
		available_dates = document.querySelectorAll('.train_avl_enq_box[selected-train="true"] td');
		b_date = booking_data.j_date.split('-');
		b_date[1] = M_to_month[b_date[1] - 1];
		date_d_M_Y = b_date.join(' ');
		var regEx_book_date = new RegExp(date_d_M_Y, 'i');
		$.each(available_dates, function(k, dates){
			if(regEx_book_date.test(dates.innerText)){
				// console.log('BOOK NOW found at -'+ k);
				target_book_now_btn = dates.querySelectorAll('button[type="submit"]')[0];
				target_book_now_btn.click();
				$.toast("Book Now Proceed");
				return false;
			}
		});
	}
	else{
		$.toast("Proceed Manually [Book Now]");
		// console.log('Proceed Manually [Book Now]');
	}
}

// TODO: fill passengers detail
function fillPassengersDetail(){
	// console.log(booking_data.psngr['A']);
	apf = document.querySelectorAll('app-passenger');
	booking_data.psngr['A'] = booking_data.psngr['A'].filter((obj) => obj );
	ap_count = booking_data.psngr['A'].length;
	var need_more_A = 0;
	if(apf.length < ap_count){
		need_more_A = ap_count - apf.length;
	}

	// Adult passenger details
	if(need_more_A){
		add_psngr_button = document.querySelectorAll('.updatesDiv .prenext')[0];
		for(var a=0; a<need_more_A; a++){
			add_psngr_button.click();
		}
	}
	apf_updated = document.querySelectorAll('app-passenger');
	$.each(booking_data.psngr['A'], function(k, passenger){
		input_select = apf_updated[k].querySelectorAll('.form-group input,select');
		setPassengerValue(input_select[0], passenger.name);
		setPassengerValue(input_select[1], passenger.age);
		setPassengerValue(input_select[2], passenger.gender);
		if(passenger.choice != "")
			setPassengerValue(input_select[3], passenger.choice);
	});


	// console.log(booking_data.psngr['C']);
	cpf = document.querySelectorAll('.passengerDiv [formarrayname="infantList"] .infant_box');
	booking_data.psngr['C'] = booking_data.psngr['C'].filter((obj) => obj );
	cp_count = booking_data.psngr['C'].length;
	var need_mode_C = 0;
	if(cpf.length < cp_count){
		need_mode_C = cp_count - cpf.length;
	}
	if(need_mode_C){
		add_child_button = document.querySelectorAll('.passengerDiv .pip-detail a')[0];
		for(var c=0; c<need_mode_C; c++){
			add_child_button.click();
		}
	}

	cpf_updated = document.querySelectorAll('.passengerDiv [formarrayname="infantList"] .infant_box');
	$.each(booking_data.psngr['C'], function(l, passenger){
		input_select = cpf_updated[l].querySelectorAll('.form-group input,select');
		setPassengerValue(input_select[0], passenger.name);
		setPassengerValue(input_select[1], passenger.age);
		setPassengerValue(input_select[2], passenger.gender);
	});

	// console.log(booking_data);
	mobile_no = document.querySelectorAll('#mobileNumber')[0];
	mobile_no.value = booking_data.mobile_no;

	// Booking Options
	if(true === booking_data.auto_upgradation){
		// console.log($('[name="autoUpgradation"]'));
		$('[name="autoUpgradation"]').prop('checked', true);
	}
	if(true === booking_data.confirm_berths){
		// console.log($('[name="confirmberths"]'));
		$('[name="confirmberths"]').prop('checked', true);
	}
	if(true === booking_data.coach_preferred){
		// console.log($('[name="coachPreferred"]'));
		$('[name="coachPreferred"]').prop('checked', true);
		// console.log($('[formcontrolname="coachId"]'));
		$('[formcontrolname="coachId"]').val(booking_data.coach_preferred_no);
	}

	$('[formcontrolname="reservationChoice"][value="'+ booking_data.reservation_choice +'"]').prop('checked', true);

	// insurance mark ad YES
	$('#travelInsuranceOptedYes').prop('checked', true);
	$('#travelInsuranceOptedYes')[0].dispatchEvent(new Event('change'));

	// Mark as done
	document.querySelectorAll('.stepwizard-step')[0].setAttribute('passenger-info', 'filled');
	// TODO: Scroll page and focus to captcha
	$.toast("Passenger Details Filled, [Enter Captcha]", "SUCCESS");
}

function setPassengerValue(element, value) {
	if(element.nodeName.toUpperCase() == 'INPUT'){
		element.value = value;
		element.dispatchEvent(new Event('keydown'));
		element.dispatchEvent(new Event('input'));
	}
	else if(element.nodeName.toUpperCase() == 'SELECT'){
		element.value = value;
		element.dispatchEvent(new Event('change'));
	}
}

function reviewDone(){
	if(true === booking_data.auto_proceed){
		review_btns = 	document.querySelectorAll('app-review-booking [type="submit"]');
		// console.log(review_btns);
		$.each(review_btns, function(k,b){
			// console.log(b);
			// console.log(b.innerText);
			if(b.innerText == "Continue Booking"){
				b.click();
				$.toast("Booking Review Done");
				return false;
			}
		});
	}else{
		$.toast('Proceed Manually [Booking Review]');
	}
}


function selectPaymentMethod(){
	available_payment_method_li = document.querySelectorAll('app-payment form ul li a');
	pay_mod_regEx = new RegExp(payment_opt[booking_data.pay_mod].replace(/\s/g,'').toLowerCase(), 'i');
	// console.log(pay_mod_regEx);

	$.each(available_payment_method_li, function(k, link){
		if(true === pay_mod_regEx.test(link.innerText.replace(/\s/g,'').toLowerCase())){
			link.click();
			document.querySelectorAll('.stepwizard-step')[2].setAttribute('payment-method','selected');
			document.querySelectorAll('.stepwizard-step')[2].setAttribute('selected-header', link.attributes['aria-controls'].value);
			$.toast("Payment Method Selected");
			return false;
		}
	});
}

function selectPaymentBank(){
	header = document.querySelectorAll('.stepwizard-step[payment-method="selected"]')[0].attributes['selected-header'].value;
	payment_banks = document.querySelectorAll('p-tabpanel #'+header)[0].querySelectorAll('.payment_box');
	bank_regEx = new RegExp(booking_data.bank_name.trim().toLowerCase());
	for(var j=0; j < payment_banks.length; j++){
		// console.log(bank_regEx);
		bank_name = (payment_banks[j].querySelectorAll('label span')[0].innerText).trim().toLowerCase();
		// console.log(bank_name);
		// console.log(bank_regEx.test(bank_name));
		if(bank_regEx.test(bank_name)){
			// console.log('Found - '+ bank_name);
			// console.log('click Now');
			payment_banks[j].click();
			payment_banks[j].setAttribute('bank-index', "found");
			$.toast("Payment Bank Selected");
			break;
		}
	}
}

function triggerMakePayment(){
	bank_node = document.querySelectorAll('.payment_box[bank-index="found"]');
	if(bank_node.length > 0 && true === booking_data.auto_proceed){
		bank_node[0].querySelector('button').click();
		$.toast("Payment Initiated", "SUCCESS");
	}
}

function popupMsg(msg){
	$('#tatkal-msg').html(msg);
}

function waitLoop(){
	if(false === watcher){
		return false;
	}
	// console.log(++loop);

	step_need = detectStep();
	console.log(step_need);
	if(step_need == 'login-open' || step_need == 'login-fill'){
		fillLogin();
	}else if(step_need == 'login-wait'){
		$.toast("Proceed Manually [Fill Login Captcha and login]");
	}else if(step_need == 'fill-search'){
		fillSearchDetail();
	}else if(step_need == 'search-btn-trigger'){
		triggerSearchBtn();
	}else if(step_need == 'set-quota'){
		selectQuota();
	}else if(step_need == 'select-train'){
		selectTrainCard();
	}else if(step_need == 'select-coach-class'){
		selectCoachClass();
	}else if(step_need == 'check-availability-btn-trigger'){
		triggerAvailBtn();
	}else if(step_need == 'book-now-btn-trigger'){
		triggerBookNowBtn();
	}else if(step_need == 'fill-passenger'){
		fillPassengersDetail();
	}else if(step_need == 'wait-passenger-captcha'){
		$.toast('Proceed Manually [Fill Captcha and click Continue]');
	}else if(step_need == 'wait-review'){
		reviewDone();
	}else if(step_need == 'select-payment-method'){
		selectPaymentMethod();
	}else if(step_need == 'user-bank-not-found'){
		$.toast('Proceed Manually [Select Payment Bank]');
	}else if(step_need == 'select-payment-bank'){
		selectPaymentBank();
	}else if(step_need == 'make-payment-btn-trigger'){
		triggerMakePayment();
	}
	setTimeout(waitLoop, 500);
}