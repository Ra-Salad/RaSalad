/*
 * Static replacement for the Spectra (Ultimate Addons) form handler.
 *
 * The WordPress version posted to wp-admin/admin-ajax.php, which does not exist
 * on a static host. This posts the same fields to Formspree instead, so the
 * destination address is stored on Formspree's side and never appears in this
 * page's source.
 *
 * SETUP: create a free form at https://formspree.io, then paste its ID below.
 * The ID is the last part of the endpoint Formspree gives you, e.g. for
 * https://formspree.io/f/abcdwxyz the ID is "abcdwxyz".
 */
var FORMSPREE_FORM_ID = 'xljrwlqq';

(function () {
	'use strict';

	// Field ids are Spectra block ids; map them to readable names for the email.
	var FIELD_LABELS = {
		'552c5e41': 'First name',
		'062762a3': 'Last name',
		'c511a76b': 'Email',
		'aa21c0d5': 'Phone',
		'567d3099': 'Message'
	};

	function formSuffix( form ) {
		var name = form.getAttribute( 'name' ) || '';
		return name.replace( /^uagb-form-/, '' );
	}

	function showMessage( suffix, kind ) {
		[ 'success', 'failed' ].forEach( function ( type ) {
			var el = document.querySelector( '.uagb-forms-' + type + '-message-' + suffix );
			if ( ! el ) {
				return;
			}
			el.classList.toggle( 'uagb-forms-submit-message-hide', type !== kind );
			el.classList.toggle( 'uagb-forms-submit-message-show', type === kind );
		} );
	}

	function collect( form ) {
		var payload = {};
		Array.prototype.forEach.call( form.querySelectorAll( '.uagb-forms-input' ), function ( input ) {
			var label = FIELD_LABELS[ input.name ] || input.name;
			payload[ label ] = input.value.trim();
		} );
		if ( payload.Email ) {
			payload.email = payload.Email;
		}
		payload._subject = 'rasalad.com contact form';
		return payload;
	}

	function setBusy( form, busy ) {
		var button = form.querySelector( '.uagb-forms-main-submit-button' );
		if ( button ) {
			button.disabled = busy;
			button.style.opacity = busy ? '0.6' : '';
		}
	}

	function submit( event ) {
		var form = event.target;
		if ( ! form.classList || ! form.classList.contains( 'uagb-forms-main-form' ) ) {
			return;
		}

		event.preventDefault();
		event.stopImmediatePropagation();

		if ( ! form.checkValidity() ) {
			form.reportValidity();
			return;
		}

		var suffix = formSuffix( form );

		if ( ! FORMSPREE_FORM_ID || FORMSPREE_FORM_ID.indexOf( 'PASTE_YOUR' ) === 0 ) {
			showMessage( suffix, 'failed' );
			console.error( 'contact-form.js: FORMSPREE_FORM_ID has not been set yet.' );
			return;
		}

		setBusy( form, true );

		fetch( 'https://formspree.io/f/' + FORMSPREE_FORM_ID, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
			body: JSON.stringify( collect( form ) )
		} )
			.then( function ( response ) {
				if ( ! response.ok ) {
					throw new Error( 'Formspree responded ' + response.status );
				}
				form.reset();
				showMessage( suffix, 'success' );
			} )
			.catch( function ( error ) {
				showMessage( suffix, 'failed' );
				console.error( error );
			} )
			.then( function () {
				setBusy( form, false );
			} );
	}

	// Capture phase so this runs even if another handler is attached to the form.
	document.addEventListener( 'submit', submit, true );
} )();
