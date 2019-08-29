const STEP1_URL = "https://www.irctc.co.in/nget/train-search";
const STEP2_URL = "https://www.irctc.co.in/nget/train-list";
const STEP3_URL = "https://www.irctc.co.in/nget/psgninput";
const STEP4_URL = "https://www.irctc.co.in/nget/reviewBooking";
const STEP5_URL = "https://www.irctc.co.in/nget/bkgPaymentOptions";
const ERROR_URL = "https://www.irctc.co.in/nget/error";

const IRCTC_STATION_LIST = "https://www.irctc.co.in/eticketing/StationLinguisticNames?hl=en";
// https://www.irctc.co.in/eticketing/StationLinguisticNames?hl=en_hi
// https://www.irctc.co.in/eticketing/StationLinguisticNames?hl=en
// http://www.indianrail.gov.in/mail_express_trn_list.html

const STORAGE_KEY_PREFIX = "SuperFastTatkal";

const SUPPORT_EMAIL = "mukesh3797+extension@gmail.com";
const br = "%0d%0a";
const support_email_message = `Hi,`+br+`I want support regarding this extention.`+br+`Name:`+br+`Mobile:`;
const bugReport_email_message = `Hi,`+br+`I wanted to intimate you regarding the bug i found in this app. Please Fix this as soon as possible.`+br+`Name:`+br+`Mobile:`;
const feedSugges_email_message = `Hi,`+br+`I want to inform you that I am very happy this app and it's wokring fine with me.`+br+`Name:`+br+`Mobile:`;

const PRODUCTION = false;

let weeks = ["", "Monday", "Tuesday", "Wednesday", "Thrusday", "Friday", "Saturday", "Sunday"];
let M_to_month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

let quota = {"GN":"General","TK":"Tatkaal","PT":"Primium Tatkaal"};

let checkBox = ['confirm_berths','auto_upgradation','coach_preferred','auto_proceed'];
let radioBox = ['pay_mod', 'reservation_choice'];

let payment_opt = {
	"OPB": 	"Preferred Bank",
	"UPI": 	"BHIM/ UPI/ USSD",
	"MPS": 	"Multiple Payment Service",
	"DCP": 	"Debit Card with PIN",
	"ONB": 	"Net Banking",
	"WCC": 	"Wallets / Cash Card",
	"IRP": 	"IRCTC Prepaid",
	"COD": 	"Pay-On-Delivery/Pay later",
	"CDC": 	"Payment Gateway /Credit /Debit Cards"
};

let payment_bank_opt = {
	"OPB": 	["State Bank of India", "Union Bank of India"],
	"UPI": 	["Pay using BHIM (Powered by AXIS BANK) also accepts UPI"],
	"MPS": 	["ATOM","Paytm","ITZ","PayU","Razorpay"],
	"DCP": 	["State Bank of India","Canara Bank","HDFC Bank","AXIS Bank","United Bank of India"],
	"ONB": 	["State Bank of India", "Federal Bank", "Union Bank of India", "Indian Bank", "Punjab National Bank", "Allahabad Bank", "HDFC Bank", "Bank of Baroda", "Vijaya Bank", "AXIS Bank", "Karur Vysya Bank", "Karnataka Bank", "Oriental Bank of Commerce", "ICICI Bank", "IndusInd Bank", "Kotak Mahindra Bank", "Bank of India", "Central Bank of India", "Bank of Maharashatra", "Syndicate Bank", "Corporation Bank", "Yes Bank", "Nepal SBI Bank Ltd.", "South Indian Bank", "City Union Bank", "Canara Bank", "Airtel Payments Bank(Offers)"],
	"WCC": 	["Mobikwik Wallet", "Paytm Wallet(Offers)", "Freecharge Wallet(Offers)", "OLAMONEY Wallet", "Airtel Money", "I Cash Card"],
	"IRP": 	[],
	"COD": 	[],
	"CDC": 	["Visa/Master Card(Powered By CITI BANK)", "Visa/Master Card(Powered By HDFC BANK)", "American Express", "Visa/Master Card(Powered By AXIS BANK)", "RuPay Card (Powered by Kotak Bank)"]
}

let permit_payment = ["OPB","UPI","MPS","DCP","ONB","WCC","CDC"];

let valid_quota = {
	"GN": "GENERAL",
	"SS": "SR.CITIZEN",
	"LD": "LADIES",
	"HP": "DIVYAANG",
	"TQ": "TATKAL",
	"PT": "PREMIUM TATKAL"
};


let card_tmpl = `
				<div class="col-sm-4 py-2 px-2">
					<div class="card card-dark">
						<div class="card-header px-2 py-1">
							<span><a class="link pointer" data-action="edit" data-hash="{{hash}}"><i class="far fa-eye mr-2 text-muted"></i><span>{{form_name}}</span></a></span>
						</div>
						<div class="card-body p-2">
							<div class="row text-center font-weight-bold">
								<div class="col">{{from}}</div>
								<div class="col"><i class="fa fa-train"></i></div>
								<div class="col">{{to}}</div>
							</div>
							<p class="text-center p-0 m-0 text-md text-secondary"><strong>{{train_no}}</strong> : <span>{{train_name}}</span></p>
							<div class="border-bottom my-2"></div>
							<div class="row m-0">
								<div class="col text-center mx-2">
									<span class="m-badge badge-dark">{{j_date}}</span><br>
									<span class="text-uppercase">Adult</span><br>
									<span style="font-size: 25px;" class="font-weight-bold">{{psgn_count}}</span>
								</div>
								<div class="col text-center mx-2">
									<span class="m-badge badge-info text-uppercase">{{j_day}}</span><br>
									<span class="text-uppercase">Child</span><br>
									<span style="font-size: 25px;" class="font-weight-bold">{{psgn_ch_count}}</span>
								</div>
								<div class="col-sm-12 text-center">
									<span class="m-badge badge-info text-uppercase">{{class}}</span>
									<span class="m-badge badge-dark text-uppercase">{{quota}}</span>
								</div>
							</div>
							<div class="border-bottom my-2"></div>
							<div class="btn-group d-flex" role="group">
								<button class="btn btn-success btn-sm w-100" data-action="triggerBooking" data-hash="{{hash}}"><i class="fab fa-superpowers mr-2"></i>Book Now</button>
								<button class="btn btn-warning btn-sm w-100" data-action="edit" data-hash="{{hash}}"><i class="fa fa-edit mr-2"></i>Edit</button>
								<button class="btn btn-danger btn-sm w-100" data-action="delete" data-hash="{{hash}}"><i class="fa fa-trash-alt mr-2"></i>Delete</button>
							</div>
						</div>
					</div>
				</div>
				`;

let passenger_row = `
					<tr>
						<td>
							<input data-field="p_name" class="form-control form-control-sm" placeholder="Passenger #{{pcount}}" maxlength="16" value="" type="text">
						</td>
						<td>
							<input data-field="p_age" class="form-control form-control-sm" value="" type="text" maxlength="3">
						</td>
						<td>
							<select data-field="p_gender" class="form-control form-control-sm">
								<option value="NONE">Select</option>
								<option value="M">Male</option>
								<option value="F">Female</option>
								<option value="T">Transgender</option>
							</select>
						</td>
						<td>
							<select data-field="p_choice" class="form-control form-control-sm">
								<option value="NONE">No Preference</option>
								<optgroup label="(SL, 3A, 2A) seats">
									<option value="LB">LOWER</option>
									<option value="MB">MIDDLE</option>
									<option value="UB">UPPER</option>
									<option value="SL">SIDE LOWER</option>
									<option value="SU">SIDE UPPER</option>
								</optgroup>
								<optgroup label="(2S, CC) seats">
									<option value="WS">WINDOW SIDE</option>
								</optgroup>
								<optgroup label="(1A) seats">
									<option value="CB">CABIN</option>
									<option value="CP">COUPE</option>
								</optgroup>
							</select>
						</td>
						<td>
							<select data-field="p_food" class="form-control form-control-sm">
							    <option selected value="V">Veg</option>
							    <option value="NV">Non-Veg</option>
							    <option value="D">No Food</option>
							</select>
						</td>
						<td><input type="checkbox" data-field="p_bedroll"></td>
						<td>
						    <select data-feild="p_senior" disabled="true" class="form-control form-control-sm">
						        <option selected value="1">Avail Concession</option>
						        <option value="2">Forgo 50% Concession</option>
						        <option value="3">Forgo Full Concession</option>
						    </select>
						</td>
						<td><input type="checkbox" data-field="opt_berth" checked="checked" disabled="true">
						<td>
							<span data-action="reset_row"><i class="fa fa-undo" aria-hidden="true"></i></span>
						</td>
					</tr>
					`;

let child_passenger_row = `
						<tr>
							<td>
								<input data-field="p_name" class="form-control form-control-sm" placeholder="Passenger #{{pcount}}" maxlength="16" value="" type="text">
							</td>
							<td>
								<select class="form-control form-control-sm" data-field="age">
									<option value="NONE" selected>Age</option>
									<option value="0">Below one year</option>
									<option value="1">One year</option>
									<option value="2">Two years</option>
									<option value="3">Three years</option>
									<option value="4">Four years</option>
								</select>
							</td>
							<td>
								<select data-field="gender" class="form-control form-control-sm">
									<option value="NONE">Select</option>
									<option value="M">Male</option>
									<option value="F">Female</option>
									<option value="T">Transgender</option>
								</select>
							</td>
							<td>
								<span data-action="reset_row"><i class="fa fa-undo" aria-hidden="true"></i></span>
							</td>
						</tr>
						`;

let CARD_POPUP = `
				<div class="col-sm-4 py-2 px-2">
					<div class="card card-dark">
						<div class="card-header px-2 py-1">
							<span><i class="far fa-eye mr-2 text-muted"></i><a class="link pointer" data-action="edit" data-hash="{{hash}}">{{form_name}}</a></span>
						</div>
						<div class="card-body p-2">
							<div class="row text-center font-weight-bold">
								<div class="col">{{from}}</div>
								<div class="col"><i class="fa fa-train"></i></div>
								<div class="col">{{to}}</div>
							</div>
							<p class="text-center p-0 m-0 text-md text-secondary"><strong>{{train_no}}</strong> : <span>{{train_name}}</span></p>
							<div class="border-bottom my-2"></div>
							<div class="row">
								<div class="col text-center">
									<span class="m-badge badge-dark">{{j_date}}</span><br>
									<span class="text-uppercase">Adult</span><br>
									<span style="font-size: 25px;" class="font-weight-bold">{{psgn_count}}</span>
								</div>
								<div class="col text-center">
									<span class="m-badge badge-info text-uppercase">{{j_day}}</span><br>
									<span class="text-uppercase">Child</span><br>
									<span style="font-size: 25px;" class="font-weight-bold">{{psgn_ch_count}}</span>
								</div>
								<div class="col-sm-12 text-center">
									<span class="m-badge badge-info text-uppercase">{{class}}</span>
									<span class="m-badge badge-dark text-uppercase">{{quota}}</span>
								</div>
							</div>
							<div class="border-bottom my-2"></div>
							<div class="btn-group d-flex" role="group">
								<button class="btn btn-success btn-sm w-100" data-action="triggerBooking" data-hash="{{hash}}"><i class="fab fa-superpowers mr-2"></i>Book</button>
								<button class="btn btn-warning btn-sm w-100" data-action="edit" data-hash="{{hash}}"><i class="fa fa-edit mr-2"></i>Edit</button>
								<button class="btn btn-danger btn-sm w-100" data-action="delete" data-hash="{{hash}}"><i class="fa fa-trash-alt mr-2"></i>Delete</button>
							</div>
						</div>
					</div>
				</div>
				`;

(function($){
	var Toaster = $('<div/>').addClass('toaster').css({
		"position": 'fixed',
		"top": "100px",
		"right": "10px",
		"z-index": "200",
		"padding":"10px",
		"background-color": "#353535",
		"color" : "#FFFFFF",
		"border-top": "5px solid",
		"border-radius": "0px 0px 4px 4px",
		"font-family": "normal,Calibri,arial",
		"-webkit-box-shadow": "0px 0px 6px 0px rgba(0,0,0,0.75)",
		"-moz-box-shadow": "0px 0px 6px 0px rgba(0,0,0,0.75)",
		"box-shadow": "0px 0px 6px 0px rgba(0,0,0,0.75)"
	}).attr({'id': 'toast', 'hidden': true}).html('Extention Loaded');

	var toast_color = {
		'INFO' : "#0BC7EF",
		'SUCCESS' : "#039826",
		'ERROR' : "#CB1B1B"
	}

	$.toast = function(message, type = 'INFO'){
		$('body #toast').remove();
		$('body').append(Toaster);
		$('#toast').html(message).css({'border-color': toast_color[type.toUpperCase()]}).fadeIn(800);
		// setTimeout(function(){
		// 	$('body #toast').fadeOut(800);
		// }, 1500);
		return this;
	};
}(jQuery));


// Standard Google Universal Analytics code

/*(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga'); // Note: https protocol here

ga('create', 'UA-54657154-2', 'auto');
ga('send', 'pageview', '/booking_form.html');
*/
function gaPage(pageName){
	return;
	console.debug("PageView Logged =", pageName);
	 _gaq.push(['_trackPageview', pageName]);
	// ga('send', 'pageview', pageName);
}

function gaEvent(categoryName, actionName, labelName){
	return;
	console.debug([categoryName, actionName, labelName]);
	_gaq.push(['_trackEvent', categoryName, actionName, labelName]);
	// _trackEvent(category, action, opt_label, opt_value, opt_noninteraction)
	/*ga('send', {
		hitType: 'event',
		eventCategory: 'TatkalExtention',
		eventAction: eventName,
		eventLabel: 'testEvent'
	});*/
}


var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-54657154-2']);
// _gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();



const encrypt = function(value, key=null){
	return CryptoJS.AES.encrypt(value, STORAGE_KEY_PREFIX + "-" +key).toString();
}

const decrypt = function(value, key=null){
	return CryptoJS.AES.decrypt(value, STORAGE_KEY_PREFIX + "-" +key).toString(CryptoJS.enc.Utf8);
}