$(function(){
	// TODO: get current targeted ticket in UI
	chrome.storage.sync.get(['booking_default'], function(result) {
		v = result.booking_default;
		console.log(v);
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
			html_temp = card_tmpl;
			$.each(temp, function(k,v){
				pattern = '{{' + k + '}}';
				regEx = new RegExp(pattern, 'g');
				html_temp = html_temp.replace(regEx, v);
			});

			$('#active_booking').html('').append(html_temp);

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

	gaPage('/popup.html');
})

$('#openNew').click(function(){
	if(false === extention_status){
		// $('#extention_status_popup').trigger('click');
		$('#extention_status_popup').prop('checked', true);
		// TODO: $('#extention_status_booking').prop('checked', true);
		setExtentionStatus('ON');
		gaEvent("POPUP", "Auto", "Extention ON");
	}
	chrome.tabs.create({
		url:chrome.runtime.getURL('html/booking_form.html'),
		active: true
	});
	gaEvent("POPUP", "clicked", "Add New");
});

$('#extention_status_popup').click(function(){
	if($(this).is(':checked') === true){
		// $('#extention_status_booking').prop('checked', true);
		setExtentionStatus('ON');
		gaEvent("POPUP", "clicked", "Extention ON");
	}else{
		// $('#extention_status_booking').prop('checked', false);
		setExtentionStatus('OFF');
		gaEvent("POPUP", "clicked", "Extention OFF");
	}
});

document.onkeyup = function(e) {
	if (e.which == 120) {
		$('[data-action="triggerBooking"]').trigger('click');
		gaEvent("POPUP", "Hot Key", "Booking Trigger");
	}
};


