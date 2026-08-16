/*
 * Portfolio video gallery.
 *
 * Reads its content from assets/data/portfolio-videos.js and renders the reel,
 * the filterable grid and the popup player. Replaces the video-gallery-block
 * plugin, which positioned every tile with absolute coordinates and had to
 * recalculate them on every resize.
 *
 * Nothing here is fetched over the network, so the grid cannot be left
 * half-built by a request that fails or arrives late.
 */
( function () {
	'use strict';

	var SCRIPT_SRC = ( document.currentScript && document.currentScript.src ) || '';

	// Poster paths in the data file are written relative to the site root. This
	// resolves them from the script's own location (scripts/video-gallery.js),
	// so the gallery works at a domain root and in a subdirectory without being
	// told which it is.
	var SITE_ROOT = SCRIPT_SRC ? new URL( '../', SCRIPT_SRC ).href : '/';

	var EMBED_BASE = 'https://www.youtube-nocookie.com/embed/';
	var ALL_LABEL = 'All Videos';

	var PLAY_ICON =
		'<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">' +
		'<path d="M50 2a48 48 0 1 0 0 96 48 48 0 0 0 0-96zm0 8a40 40 0 1 1 0 80 40 40 0 0 1 0-80z"/>' +
		'<path d="M39 30l30 20-30 20z"/></svg>';

	function icon( path ) {
		return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="' + path + '"/></svg>';
	}

	var CLOSE_ICON = icon( 'M6 6l12 12M18 6L6 18' );
	var PREV_ICON = icon( 'M15 5l-7 7 7 7' );
	var NEXT_ICON = icon( 'M9 5l7 7-7 7' );

	var reduceMotion = window.matchMedia && window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

	/* ------------------------------------------------------------- helpers */

	// Accepts a bare ID, a youtu.be link, or a watch?v= link.
	function youtubeId( value ) {
		var raw = String( value || '' ).trim();
		var match =
			raw.match( /(?:youtu\.be\/|\/embed\/|[?&]v=)([A-Za-z0-9_-]{6,})/ ) ||
			raw.match( /^([A-Za-z0-9_-]{6,})$/ );
		return match ? match[ 1 ] : '';
	}

	function posterUrl( path ) {
		var value = String( path || '' ).trim();
		if ( ! value ) {
			return '';
		}
		if ( /^(?:https?:)?\/\//.test( value ) || value.charAt( 0 ) === '/' ) {
			return value;
		}
		return SITE_ROOT + value.replace( /^\.?\//, '' );
	}

	// Ctrl/Cmd/shift/middle click should still reach YouTube in a new tab.
	function openInNewTab( event ) {
		return event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0;
	}

	function element( tag, className ) {
		var el = document.createElement( tag );
		if ( className ) {
			el.className = className;
		}
		return el;
	}

	/* -------------------------------------------------------------- player */

	var lightbox = {
		root: null,
		stage: null,
		caption: null,
		count: null,
		prev: null,
		next: null,
		list: [],
		index: 0,
		lastFocus: null,

		build: function () {
			if ( this.root ) {
				return;
			}

			var root = element( 'div', 'ra-lightbox' );
			root.setAttribute( 'role', 'dialog' );
			root.setAttribute( 'aria-modal', 'true' );
			root.setAttribute( 'aria-label', 'Video player' );

			this.count = element( 'p', 'ra-lightbox__count' );

			var close = element( 'button', 'ra-lightbox__button ra-lightbox__close' );
			close.type = 'button';
			close.setAttribute( 'aria-label', 'Close video' );
			close.innerHTML = CLOSE_ICON;

			this.prev = element( 'button', 'ra-lightbox__button ra-lightbox__prev' );
			this.prev.type = 'button';
			this.prev.setAttribute( 'aria-label', 'Previous video' );
			this.prev.innerHTML = PREV_ICON;

			this.next = element( 'button', 'ra-lightbox__button ra-lightbox__next' );
			this.next.type = 'button';
			this.next.setAttribute( 'aria-label', 'Next video' );
			this.next.innerHTML = NEXT_ICON;

			this.stage = element( 'div', 'ra-lightbox__stage' );
			this.caption = element( 'p', 'ra-lightbox__caption' );

			root.appendChild( this.count );
			root.appendChild( close );
			root.appendChild( this.prev );
			root.appendChild( this.next );
			root.appendChild( this.stage );
			root.appendChild( this.caption );

			var self = this;

			close.addEventListener( 'click', function () {
				self.close();
			} );

			this.prev.addEventListener( 'click', function () {
				self.step( -1 );
			} );

			this.next.addEventListener( 'click', function () {
				self.step( 1 );
			} );

			// Clicking the dimmed area closes; clicking the player does not.
			root.addEventListener( 'click', function ( event ) {
				if ( event.target === root ) {
					self.close();
				}
			} );

			document.addEventListener( 'keydown', function ( event ) {
				if ( ! self.root || ! self.root.isConnected ) {
					return;
				}
				if ( event.key === 'Escape' ) {
					self.close();
				} else if ( event.key === 'ArrowLeft' ) {
					self.step( -1 );
				} else if ( event.key === 'ArrowRight' ) {
					self.step( 1 );
				}
			} );

			this.root = root;
			this.closeButton = close;
		},

		open: function ( list, index, trigger ) {
			if ( ! list.length ) {
				return;
			}

			this.build();
			this.list = list;
			this.index = index;
			this.lastFocus = trigger || null;

			// Hold the scrollbar's width so the page behind does not jump.
			var gap = window.innerWidth - document.documentElement.clientWidth;
			if ( gap > 0 ) {
				document.body.style.paddingRight = gap + 'px';
			}
			document.documentElement.classList.add( 'ra-lightbox-open' );

			document.body.appendChild( this.root );
			this.render();

			var self = this;
			requestAnimationFrame( function () {
				self.root.classList.add( 'is-open' );
			} );

			this.closeButton.focus();
		},

		render: function () {
			var video = this.list[ this.index ];
			var id = youtubeId( video.youtube );

			this.stage.innerHTML = '';

			var frame = document.createElement( 'iframe' );
			frame.src =
				EMBED_BASE + encodeURIComponent( id ) +
				'?autoplay=1&rel=0&fs=1&controls=1&modestbranding=1';
			frame.title = video.title || 'Video';
			frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
			frame.setAttribute( 'allowfullscreen', '' );
			frame.setAttribute( 'referrerpolicy', 'strict-origin-when-cross-origin' );
			this.stage.appendChild( frame );

			this.caption.textContent = video.title || '';

			var many = this.list.length > 1;
			this.prev.hidden = ! many;
			this.next.hidden = ! many;
			this.count.textContent = many ? ( this.index + 1 ) + ' / ' + this.list.length : '';
		},

		step: function ( delta ) {
			if ( this.list.length < 2 ) {
				return;
			}
			this.index = ( this.index + delta + this.list.length ) % this.list.length;
			this.render();
		},

		close: function () {
			if ( ! this.root || ! this.root.isConnected ) {
				return;
			}

			var root = this.root;
			var self = this;

			root.classList.remove( 'is-open' );

			var remove = function () {
				// Dropping the iframe is what actually stops playback.
				self.stage.innerHTML = '';
				if ( root.parentNode ) {
					root.parentNode.removeChild( root );
				}
				document.documentElement.classList.remove( 'ra-lightbox-open' );
				document.body.style.paddingRight = '';
				if ( self.lastFocus && self.lastFocus.isConnected ) {
					self.lastFocus.focus();
				}
			};

			if ( reduceMotion ) {
				remove();
			} else {
				window.setTimeout( remove, 280 );
			}
		}
	};

	/* ---------------------------------------------------------------- tiles */

	function buildTile( video, position ) {
		var link = element( 'a', 'ra-gallery__item' );
		var id = youtubeId( video.youtube );

		link.href = 'https://www.youtube.com/watch?v=' + id;
		link.target = '_blank';
		link.rel = 'noopener';
		link.setAttribute( 'aria-label', 'Play video: ' + ( video.title || id ) );

		var image = element( 'img', 'ra-gallery__thumb' );
		image.src = posterUrl( video.poster );
		image.alt = video.title || '';
		image.decoding = 'async';
		// The first row is visible immediately; everything else can wait.
		image.loading = position < 3 ? 'eager' : 'lazy';

		var overlay = element( 'span', 'ra-gallery__play' );
		overlay.innerHTML = PLAY_ICON;

		link.appendChild( image );
		link.appendChild( overlay );

		return link;
	}

	/* ------------------------------------------------------------ animation */

	// FLIP: measure where the tiles are, change what is visible, measure again,
	// then animate each tile from its old position to its new one. The browser
	// only ever lays the grid out once.
	function animateFilter( tiles, mutate ) {
		if ( reduceMotion || ! tiles.length || ! tiles[ 0 ].animate ) {
			mutate();
			return;
		}

		var before = new Map();
		tiles.forEach( function ( tile ) {
			if ( ! tile.hidden ) {
				before.set( tile, tile.getBoundingClientRect() );
			}
		} );

		mutate();

		tiles.forEach( function ( tile ) {
			if ( tile.hidden ) {
				return;
			}

			var last = tile.getBoundingClientRect();
			var first = before.get( tile );

			if ( first ) {
				var dx = first.left - last.left;
				var dy = first.top - last.top;
				if ( ! dx && ! dy ) {
					return;
				}
				tile.animate(
					[
						{ transform: 'translate(' + dx + 'px, ' + dy + 'px)' },
						{ transform: 'translate(0, 0)' }
					],
					{ duration: 420, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
				);
			} else {
				tile.animate(
					[
						{ opacity: 0, transform: 'scale(0.94)' },
						{ opacity: 1, transform: 'scale(1)' }
					],
					{ duration: 320, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
				);
			}
		} );
	}

	/* -------------------------------------------------------------- galleries */

	function renderReel( mount, reel ) {
		if ( ! reel || ! youtubeId( reel.youtube ) ) {
			return;
		}

		var grid = element( 'div', 'ra-gallery__grid' );
		var tile = buildTile( reel, 0 );

		tile.addEventListener( 'click', function ( event ) {
			if ( openInNewTab( event ) ) {
				return;
			}
			event.preventDefault();
			lightbox.open( [ reel ], 0, tile );
		} );

		grid.appendChild( tile );
		mount.appendChild( grid );
	}

	function renderGrid( mount, videos, categories ) {
		var usable = videos.filter( function ( video ) {
			return youtubeId( video.youtube );
		} );

		if ( ! usable.length ) {
			return;
		}

		var tiles = [];
		var grid = element( 'div', 'ra-gallery__grid' );

		// Prev/next should walk whatever the current filter is showing.
		var visible = function () {
			var shown = [];
			tiles.forEach( function ( tile, tileIndex ) {
				if ( ! tile.hidden ) {
					shown.push( usable[ tileIndex ] );
				}
			} );
			return shown;
		};

		usable.forEach( function ( video, position ) {
			var tile = buildTile( video, position );

			tile.addEventListener( 'click', function ( event ) {
				if ( openInNewTab( event ) ) {
					return;
				}
				event.preventDefault();
				var list = visible();
				lightbox.open( list, list.indexOf( video ), tile );
			} );

			tiles.push( tile );
			grid.appendChild( tile );
		} );

		// Only offer filters that some video actually belongs to.
		var offered = ( categories || [] ).filter( function ( name ) {
			return usable.some( function ( video ) {
				return ( video.categories || [] ).indexOf( name ) !== -1;
			} );
		} );

		if ( offered.length > 1 ) {
			var bar = element( 'div', 'ra-gallery__filters' );
			bar.setAttribute( 'role', 'group' );
			bar.setAttribute( 'aria-label', 'Filter videos by type' );

			var buttons = [];

			[ ALL_LABEL ].concat( offered ).forEach( function ( name, position ) {
				var button = element( 'button', 'ra-gallery__filter' );
				button.type = 'button';
				button.textContent = name;
				button.setAttribute( 'aria-pressed', position === 0 ? 'true' : 'false' );

				button.addEventListener( 'click', function () {
					buttons.forEach( function ( other ) {
						other.setAttribute( 'aria-pressed', String( other === button ) );
					} );

					animateFilter( tiles, function () {
						tiles.forEach( function ( tile, tileIndex ) {
							var video = usable[ tileIndex ];
							var match =
								name === ALL_LABEL ||
								( video.categories || [] ).indexOf( name ) !== -1;
							tile.hidden = ! match;
						} );
					} );
				} );

				buttons.push( button );
				bar.appendChild( button );
			} );

			mount.appendChild( bar );
		}

		mount.appendChild( grid );
	}

	/* ------------------------------------------------------------------ init */

	function init() {
		var data = window.RA_PORTFOLIO;

		if ( ! data ) {
			console.error( 'video-gallery.js: portfolio-videos.js did not load, so there is no video data to show.' );
			return;
		}

		document.querySelectorAll( '[data-ra-gallery]' ).forEach( function ( mount ) {
			try {
				mount.innerHTML = '';
				var inner = element( 'div', 'ra-gallery__inner' );
				mount.appendChild( inner );

				if ( mount.getAttribute( 'data-ra-gallery' ) === 'reel' ) {
					renderReel( inner, data.reel );
				} else {
					renderGrid( inner, data.videos || [], data.categories );
				}
			} catch ( error ) {
				console.error( 'video-gallery.js: could not build gallery.', error );
			}
		} );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', init );
	} else {
		init();
	}
} )();
