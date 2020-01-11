
let bookingActive = {};
let loop = 0;
let watcher = false;
let shortcut = false;
let class_interval = false;
let timer = false;

document.body.onload = function(){
	chrome.storage.sync.get(['extention_status'], function(result) {
		if(typeof result.extention_status != 'undefined')
			watcher = result.extention_status;
		if(true === watcher){
			chrome.storage.sync.get(['booking_active'], function(result) {
				bookingActive = result.booking_active;
				$.toast("Booking Started you need to <strong>click</strong> only three palce and two captcha");
				waitLoop();
			});
		}
	});	
};

/**
 * Alt+A = fill one step
 * Alt+Shift+A = fill all for current url
 */
// Control Autofill by pressing [shift+A]
window.onkeyup = function(e){
    let pressed = "";
    if(e.shiftKey)
        pressed += "Shift";
    if(e.ctrlKey)
    	pressed += 'Ctrl';
    if(e.altKey)
    	pressed += 'Alt';
    pressed += e.keyCode;
    // console.log(pressed);

   	if(pressed === 'Alt65'){
   		shortcut = true;
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
    	shortcut = false;
   	}else if(pressed == 'ShiftAlt65'){
   		fillForceUpdate();
    }
}

const fillForceUpdate = function(){
	watcher = false;
	chrome.storage.sync.get(['booking_active'], function(result) {
		bookingActive = result.booking_active;
	});

	let page = getPageStep();
	if(page === 1){
		$('[placeholder="From*"]').val('');
	}else if(page === 2){
		modifySearch();
	}else if(page === 3){
		fillPassengersDetail();
	}else if(page === 4){

	}else if(page === 5){
		selectPaymentMethod();
		selectPaymentBank();
	}else if(page === 6){
		window.location.href = STEP1_URL;
	}
	watcher = true;
}

function modifySearch(){
	origin = document.querySelectorAll("p-autocomplete[id='origin']")[0].querySelectorAll('input')[0];
	destination = document.querySelectorAll("p-autocomplete[id='destination']")[0].querySelectorAll('input')[0];

	origin.value = bookingActive.from_station;
	origin.dispatchEvent(new Event('keydown'));
	origin.dispatchEvent(new Event('input'));

	destination.value = bookingActive.to_station;
	destination.dispatchEvent(new Event('keydown'));
	destination.dispatchEvent(new Event('input'));

	// update coach class
	let classCaret = document.querySelectorAll('[formcontrolname="journeyClass"] .fa-caret-down')[0];
	classCaret.click();
	let li = document.querySelectorAll('[formcontrolname="journeyClass"] ul li');
	li.forEach(function(v){
		let li_text = $(v).text();
		let cclass = li_text.substr(li_text.indexOf("(")).replace("(", "").replace(")","");
		if(cclass == bookingActive.coach_class){
			$(v).trigger('click');
		}
	});

	// update journey date
	journeydate = document.querySelectorAll("[placeholder='Journey Date(dd-mm-yyyy)*']")[1];
	journeydate.value = bookingActive.j_date;
	journeydate.dispatchEvent(new Event('keydown'));
	journeydate.dispatchEvent(new Event('input'));
	// trigger modify button
	document.querySelectorAll('app-modify-search form button')[0].click();
}

function getPageStep(){
	url_now = document.location.href;
	if(url_now === STEP1_URL){
		return 1;
	}else if(url_now === STEP2_URL){
		return 2;
	}else if(url_now === STEP3_URL){
		return 3;
	}else if(url_now === STEP4_URL){
		return 4;;
	}else if(url_now === STEP5_URL){
		return 5;
	}else if(url_now === ERROR_URL){
		return 6;
	}
	return 0;
}

function detectStep(){
	url_now = document.location.href;
	if(url_now === STEP1_URL){
		if(true === $('#loginText').is(":visible")){
			if(true === $('app-login p-dialog div').is(':visible')){
				if($('#userId').val() !== bookingActive.IRCTC_username || $('#pwd').val() !== bookingActive.IRCTC_pwd)
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
		quota_rexEx = new RegExp(valid_quota[bookingActive.booking_quota]);
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
				class_regEx = new RegExp(bookingActive.coach_class);
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
			if(bookingActive.bank_name == 'NONE'){
				return 'user-bank-not-found';
			}
			user_bank = bookingActive.bank_name.trim().toLowerCase();
			// console.log(user_bank);
			bank_regEx = new RegExp(user_bank);
			// console.log(payment_banks);
			// console.log(bank_regEx);
			let available_bank = [];
			for(let i=0; i < payment_banks.length; i++){
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
	}else if(url_now === ERROR_URL){
		window.location.href = STEP1_URL;
	}else{
		// TODO: need to auto-fill payment credential on bank site
		return 'unknown';
	}
}

// TODO: fill userid and pass then trigger login popup
function fillLogin(){
	userId = document.getElementById("userId");
	pwd = document.getElementById("pwd");

	userId.value = bookingActive.IRCTC_username;
	userId.dispatchEvent(new Event('input'));

	pwd.value = decrypt(bookingActive.IRCTC_pwd, 'IRCTC_pwd');
	pwd.dispatchEvent(new Event('input'));

	document.getElementById("loginText").click();
	$.toast("Opening Login Window");
}

// TODO: fill search detail
function fillSearchDetail(){
	fromStation = document.querySelectorAll("p-autocomplete[id='origin']")[0].querySelectorAll('input')[0];
	toStation = document.querySelectorAll("p-autocomplete[id='destination']")[0].querySelectorAll('input')[0];
	journeydate = document.querySelectorAll("[placeholder='Journey Date(dd-mm-yyyy)*']")[1];
	classCaret = document.getElementById('journeyClass').querySelectorAll('.fa-caret-down')[0];

	fromStation.value = bookingActive.from_station;
	fromStation.dispatchEvent(new Event('keydown'));
	fromStation.dispatchEvent(new Event('input'));

	toStation.value = bookingActive.to_station;
	toStation.dispatchEvent(new Event('keydown'));
	toStation.dispatchEvent(new Event('input'));
	toStation.click();

	journeydate.value = bookingActive.j_date;
	journeydate.dispatchEvent(new Event('keydown'));
	journeydate.dispatchEvent(new Event('input'));

	classCaret.click();
	$("#journeyClass span:contains('"+ bookingActive.coach_class +"')").parent().trigger('click');
	$.toast('Journey Detail Filled', "SUCCESS");
	gaEvent("IRCTC_STATE", "clicked", "journey detail filled");
}

function triggerSearchBtn(){
	if(true === bookingActive.auto_proceed || true == shortcut){
		searchSubmit = document.querySelectorAll('[type="submit"][label="Find Trains"]')[0];
		searchSubmit.click();
		$.toast("Journey Search done");
		gaEvent("IRCTC_STATE", "clicked", "journey detail proceed");
	}else{
		$.toast('Proceed Manually [Search Journey]');
	}
}

function selectQuota(){
	search_quota_div = document.querySelectorAll('.search_div')[0];
	search_quota_div.querySelectorAll('.ui-dropdown-trigger')[0].click();
	quota_item = search_quota_div.querySelectorAll('.ui-dropdown-item');
	regEx_quota = new RegExp(valid_quota[bookingActive.booking_quota]);
	for(let i=0; i<quota_item.length; i++){
		if(regEx_quota.test(quota_item[i].outerHTML)){
			quota_item[i].click();
			$.toast("Quota Selected", "SUCCESS");
			gaEvent("IRCTC_STATE", "clicked", "quota selected");
			break;
		}
	}
}

// TODO: fill train-list
function selectTrainCard(){
	// Select Train form list
	let availableTrains = $('.train_avl_enq_box');
	let train_no = (bookingActive.train.split(":")[0]).trim();
	let regEx_TrainNo = new RegExp('\('+ train_no +'\)');
	let train_match_at = false;
	$.each(availableTrains, function(k, v){
		if(regEx_TrainNo.test(v.innerText)){
			train_match_at = k;
			return true;
		}
	});
	// Modify default Design to target train list.
	if(train_match_at || train_match_at === 0){
		target_train_list = (availableTrains[train_match_at]);
		target_train_list.style = "background-color:yellow !important;border-color:#3C4637 !important;";
		target_train_list.setAttribute('selected-train', true);
		$.toast("Target Train Found");
		gaEvent("IRCTC_STATE", "clicked", "train selected");
	}else{
		$.toast("Train no <b>["+ train_no +"]</b> not found for this trip, please change train", 'ERROR');
	}
}

function selectCoachClass(){
	class_select = document.querySelectorAll('.train_avl_enq_box[selected-train="true"] [formcontrolname="classInput"]')[0];
	regEx_class = new RegExp('\('+ bookingActive.coach_class +'\)');
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
	if(true === bookingActive.auto_proceed || true == shortcut){
		document.querySelectorAll('.train_avl_enq_box[selected-train="true"] button')[0].click();
		$.toast("Checking Availability..");
	}else{
		$.toast("Proceed Manually [Check Availability]");
	}
}

function triggerBookNowBtn(){
	if(true === bookingActive.auto_proceed || true == shortcut){
		b_date = bookingActive.j_date.split('-');
		b_date[1] = M_to_month[b_date[1] - 1];
		date_d_M_Y = b_date.join(' ');
		book_now_btn = $('.train_avl_enq_box[selected-train="true"] td:contains("'+date_d_M_Y+'") button[type="submit"]');
		book_now_div = book_now_btn.parent('div');
		if(true == /visible/.test(book_now_div.attr('style'))){
			book_now_btn.trigger('click');
		}else{
			$.toast('Wait till booking open');
		}
	}
	else{
		$.toast("Proceed Manually [Book Now]");
	}
}

// TODO: fill passengers detail
function fillPassengersDetail(){
	apf = document.querySelectorAll('app-passenger');
	bookingActive.psngr['A'] = bookingActive.psngr['A'].filter((obj) => obj );
	ap_count = bookingActive.psngr['A'].length;
	let need_more_A = 0;
	if(apf.length < ap_count){
		need_more_A = ap_count - apf.length;
	}

	// Adult passenger details
	if(need_more_A){
		add_psngr_button = document.querySelectorAll('.updatesDiv .prenext')[0];
		for(let a=0; a<need_more_A; a++){
			add_psngr_button.click();
		}
	}
	apf_updated = document.querySelectorAll('app-passenger');
	$.each(bookingActive.psngr['A'], function(k, passenger){
		input_select = apf_updated[k].querySelectorAll('.form-group input,select');
		setPassengerValue(input_select[0], passenger.name);
		setPassengerValue(input_select[1], passenger.age);
		setPassengerValue(input_select[2], passenger.gender);
		if(passenger.berth != "NONE")
			setPassengerValue(input_select[3], passenger.berth);
		else
			setPassengerValue(input_select[3], "");

		if(passenger.age >= 60){
			setPassengerValue(input_select[5], passenger.scitizon);
		}
	});


	cpf = document.querySelectorAll('.passengerDiv [formarrayname="infantList"] .infant_box');
	bookingActive.psngr['C'] = bookingActive.psngr['C'].filter((obj) => obj );
	cp_count = bookingActive.psngr['C'].length;
	let need_mode_C = 0;
	if(cpf.length < cp_count){
		need_mode_C = cp_count - cpf.length;
	}
	if(need_mode_C){
		add_child_button = document.querySelectorAll('.passengerDiv .pip-detail a')[0];
		for(let c=0; c<need_mode_C; c++){
			add_child_button.click();
		}
	}

	cpf_updated = document.querySelectorAll('.passengerDiv [formarrayname="infantList"] .infant_box');
	$.each(bookingActive.psngr['C'], function(l, passenger){
		input_select = cpf_updated[l].querySelectorAll('.form-group input,select');
		setPassengerValue(input_select[0], passenger.name);
		setPassengerValue(input_select[1], passenger.age);
		setPassengerValue(input_select[2], passenger.gender);
	});

	mobile_no = document.querySelectorAll('#mobileNumber')[0];
	mobile_no.value = bookingActive.mobile_no;

	// Booking Options
	if(true === bookingActive.auto_upgradation){
		$('[name="autoUpgradation"]').prop('checked', true);
	}
	if(true === bookingActive.confirm_berths){
		$('[name="confirmberths"]').prop('checked', true);
	}
	if(true === bookingActive.coach_preferred){
		$('[name="coachPreferred"]').prop('checked', true);
		$('[formcontrolname="coachId"]').val(bookingActive.coach_preferred_no);
	}

	$('[formcontrolname="reservationChoice"][value="'+ bookingActive.reservation_choice +'"]').prop('checked', true);

	// insurance mark ad YES
	if(document.querySelectorAll('#travelInsuranceOptedYes').length > 0 && bookingActive.insurance_choice == "YES")
		$('#travelInsuranceOptedYes').click();

	// Mark as done
	document.querySelectorAll('.stepwizard-step')[0].setAttribute('passenger-info', 'filled');
	// TODO: Scroll page and focus to captcha
	nlp_focus();
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

const nlp_focus = function(){
	$('#nlpAnswer').focus();
};

function reviewDone(){
	if(true === bookingActive.auto_proceed){
		review_btns = 	document.querySelectorAll('app-review-booking [type="submit"]');
		$.each(review_btns, function(k,b){
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
	pay_mod_regEx = new RegExp(payment_opt[bookingActive.pay_mod].replace(/\s/g,'').toLowerCase(), 'i');
	$.each(available_payment_method_li, function(k, link){
		if(true === pay_mod_regEx.test(link.innerText.replace(/\s/g,'').toLowerCase())){
			link.click();
			document.querySelectorAll('.stepwizard-step')[2].setAttribute('payment-method','selected');
			document.querySelectorAll('.stepwizard-step')[2].setAttribute('selected-header', link.attributes['aria-controls'].value);
			$.toast("Payment Method Selected");
			return false;
		}else{
			// $.toast('Payment method not matching');
		}
	});
}

function selectPaymentBank(){
	header = document.querySelectorAll('.stepwizard-step[payment-method="selected"]')[0].attributes['selected-header'].value;
	payment_banks = document.querySelectorAll('p-tabpanel #'+header)[0].querySelectorAll('.payment_box');
	bank_regEx = new RegExp(bookingActive.bank_name.trim().toLowerCase());
	for(let j=0; j < payment_banks.length; j++){
		bank_name = (payment_banks[j].querySelectorAll('label span')[0].innerText).trim().toLowerCase();
		if(bank_regEx.test(bank_name)){
			payment_banks[j].click();
			payment_banks[j].setAttribute('bank-index', "found");
			$.toast("Payment Bank Selected");
			break;
		}
	}
}

function triggerMakePayment(){
	bank_node = document.querySelectorAll('.payment_box[bank-index="found"]');
	if(bank_node.length > 0 && (true === bookingActive.auto_proceed || true == shortcut)){
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

	step_need = detectStep();
	// console.log(step_need);
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
		nlp_focus();
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
	timer = setTimeout(waitLoop, 500);
}