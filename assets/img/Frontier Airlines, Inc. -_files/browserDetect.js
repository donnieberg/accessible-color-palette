<!-- begin JavaScript: browserDetect.js
/* Browser sensing */
// Set up boolean variables to record the browser type
var isNS4 = 0;
var isIE4 = 0;
var isNew = 0;

/* Determines the browser name and browser version */
var brow = ((navigator.appName) + (parseInt(navigator.appVersion)));

/* reassign variable depending on the browser */
if (parseInt(navigator.appVersion >= 5)) {isNew = 1}
	else if (brow == "Netscape4") 
	{isNS4 = 1;}
		else if (brow == "Microsoft Internet Explorer4") 
		{isIE4 = 1;}

if (isNS4||isIE4||isNew) {
	docObj = (isNS4) ? 'document' : 'document.all';
	styleObj = (isNS4) ? '' : '.style';
	}

// end browserDetect.js -->
