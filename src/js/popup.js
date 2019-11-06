$(function(){
	$('#version').text('version - '+ chrome.app.getDetails().version);
	$('#app-name').text(chrome.app.getDetails().name);
	initPopup();
	gaPage('/popup.html');
})

const initPopup = function(){
	$('#openNew').click(function(){
		if(false === extention_status){
			$('#extention_status_popup').prop('checked', true);
			setExtentionStatus('ON');
			gaEvent("POPUP", "Auto", "Extention ON");
		}
		chrome.tabs.create({
			url:chrome.runtime.getURL('html/booking_form.html?tab=new'),
			active: true
		});
		gaEvent("POPUP", "clicked", "Add New");
	});

	$('#openTrips').click(function(){
		chrome.tabs.create({
			url:chrome.runtime.getURL('html/booking_form.html?tab=trips'),
			active: true
		});
		gaEvent("POPUP", "clicked", "Add New");
	});

	$('#extention_status_popup').click(function(){
		console.log(this);
		if($(this).is(':checked') === true){
			setExtentionStatus('ON');
			gaEvent("POPUP", "clicked", "Extention ON");
			chrome.runtime.sendMessage('Extention ON');
		}else{
			setExtentionStatus('OFF');
			gaEvent("POPUP", "clicked", "Extention OFF");
			chrome.runtime.sendMessage('Extention OFF');
		}
	});

	$('.popup-menu a').on('click', function(){
		let type = $(this).attr('title');
		let subject = "["+ chrome.app.getDetails().name +"] "+ type;
		let bodyText = type === 'Support' ? support_email_message : type === 'Report Bug' ? bugReport_email_message : type === 'Feedback - Suggestions' ? feedSugges_email_message : "Hi,";
		var emailUrl = "mailto:"+ SUPPORT_EMAIL +"?subject="+subject+"&body="+bodyText;
		chrome.tabs.create({ url: emailUrl }, function(tab) {
			setTimeout(function() {
				chrome.tabs.remove(tab.id);
			}, 500);
		});
	});
}

const renderPopupCards = function(){
	chrome.storage.sync.get(['booking_data'], function(result) {
		console.log(result.booking_data);
		$.each(Object.keys(result.booking_data), function(i, key){
			let v= result.booking_data[key];
			jd_parts = v.j_date.split('-');
			temp = {
				hash: btoa(v.booking_form_name),
				form_name: v.booking_form_name,
				from: ((v.from_station || '-').split('-')[1]).trim(),
				to: ((v.to_station || '-').split('-')[1]).trim(),
				train_no: v.train.split(":")[0].trim(),
				train_name: v.train.split(":")[1],
				j_date: v.j_date,
				j_day: weeks[new Date(jd_parts[0] + " " + M_to_month[parseInt(jd_parts[1]) - 1]+ " " + jd_parts[2]).getDay()],
				psgn_count: v.psngr.A.length,
				psgn_ch_count: v.psngr.C.length,
				class:v.coach_class,
				quota: quota[v.booking_quota]
			};
			console.log(temp);
			html_temp = CARD_POPUP;
			$.each(temp, function(k,v){
				pattern = '{{' + k + '}}';
				regEx = new RegExp(pattern, 'g');
				html_temp = html_temp.replace(regEx, v);
			});
			$('#active_booking').append(html_temp);
		});

		if(typeof v !== 'undefined' &&  v !== null){
			jd_parts = v.j_date.split('-');
			temp = {
				hash: btoa(v.booking_form_name),
				form_name: v.booking_form_name,
				from: ((v.from_station || '-').split('-')[1]).trim(),
				to: ((v.to_station || '-').split('-')[1]).trim(),
				train_no: v.train.split(":")[0].trim(),
				train_name: v.train.split(":")[1],
				j_date: v.j_date,
				j_day: weeks[new Date(jd_parts[0] + " " + M_to_month[parseInt(jd_parts[1]) - 1]+ " " + jd_parts[2]).getDay()],
				psgn_count: v.psngr.A.length,
				psgn_ch_count: v.psngr.C.length,
				class:v.coach_class,
				quota: quota[v.booking_quota]
			};
			html_temp = CARD_POPUP;
			$.each(temp, function(k,v){
				pattern = '{{' + k + '}}';
				regEx = new RegExp(pattern, 'g');
				html_temp = html_temp.replace(regEx, v);
			});

			$('#active_booking').append(html_temp);

			$('[data-action="edit"]').click(function(){
				if(true === extention_status){
					hash = $(this).attr('data-hash');
					chrome.tabs.create({
						url:chrome.runtime.getURL('html/booking_form.html?hash='+hash),
						active: true
					});
				}
			});

			$('[data-action="delete"]').click(function(){
				if(true === extention_status){
					req_hash = $(this).attr('data-hash');
					this_ = this;
					chrome.storage.sync.get(['booking_data'], function(result) {
						bd = result.booking_data;
						delete bd[req_hash];
						keys = Object.keys(bd);
						if(keys.length == 0){
							chrome.storage.sync.set({"booking_default": {}, "booking_data": {}}, function(){
								updatePendingView();
								$(this_).closest('.card').parent().remove();
							});
						}
						else if(keys.length > 0){
							hash = keys[keys.length - 1];
							active_booking = bd[hash];
							chrome.storage.sync.set({"booking_default": active_booking, "booking_data": bd}, function(){
								updatePendingView();
								$(this_).closest('.card').parent().remove();
							});
						}
					});
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
				}
			});
		}

	});
};