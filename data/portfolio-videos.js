/*
 * ============================================================================
 *  PORTFOLIO VIDEOS — this is the only file you need to edit to change the
 *  videos on the portfolio page. No rebuild, no tooling, no plugin.
 * ============================================================================
 *
 *  TO ADD A VIDEO
 *  --------------
 *  Copy one of the blocks in the `videos` list below, paste it where you want
 *  the video to appear, and change the three values:
 *
 *    youtube     The video's YouTube ID. In https://youtu.be/ERzMMouddc8 the ID
 *                is ERzMMouddc8. Pasting the whole link also works.
 *    title       Shown under the video in the popup, and read aloud by screen
 *                readers. Any text is fine.
 *    categories  Which filter buttons this video appears under. A video can be
 *                in more than one. Names must match the `categories` list.
 *    poster      The thumbnail image, as a path from the site's top folder.
 *
 *  TO REORDER
 *  ----------
 *  Move a whole { ... } block up or down. The grid follows this order exactly,
 *  filling left to right, top to bottom. Keep a comma after each closing brace
 *  except the last one.
 *
 *  TO REMOVE
 *  ---------
 *  Delete the whole { ... } block, including its trailing comma.
 *
 *  ABOUT THUMBNAILS
 *  ----------------
 *  Put new image files in  media/custom/  and write the path here without a
 *  leading slash, like  media/custom/my-new-video.jpg
 *
 *  Wide 16:9 images look best. Around 1500 pixels across is the sweet spot —
 *  much larger files only slow the page down without looking any sharper.
 *
 *  The existing thumbnails live in media/thumbnails/. You can point at those
 *  too; media/custom/ simply exists so your own files are never mistaken for
 *  generated ones.
 *
 *  TO CHANGE THE FILTER BUTTONS
 *  ----------------------------
 *  Edit the `categories` list. The "All Videos" button is added automatically.
 *  If you add a new category name here, remember to add it to the videos that
 *  belong to it.
 *
 *  A NOTE ON QUOTES
 *  ----------------
 *  Text is wrapped in "double quotes". If a title itself contains a double
 *  quote, put a backslash before it, like  "The \"Best\" Film".  Apostrophes
 *  need nothing special.
 */

window.RA_PORTFOLIO = {

	// The large single video at the top of the page.
	reel: {
		youtube: "p_sRUSicNCA",
		title: "Ra Salad Reel",
		poster: "media/thumbnails/production-reel-2048x1152.png"
	},

	// Filter buttons, shown in this order after "All Videos".
	categories: [ "Commercial", "Film", "Music Video" ],

	// The grid, in display order.
	videos: [

		{
			youtube: "ERzMMouddc8",
			title: "Micron Mapper Product Commercial",
			categories: [ "Commercial" ],
			poster: "media/thumbnails/micron-mapper-commercial-1536x864.jpg"
		},

		{
			youtube: "4L5FpH0lRT0",
			title: "Holy Fawn - \"Death is a Relief\" (Official Video)",
			categories: [ "Music Video" ],
			poster: "media/thumbnails/holy-fawn-death-is-a-relief-1536x864.jpg"
		},

		{
			youtube: "Tz1szqJrY8c",
			title: "Scottsdale Community College Service Learning Promotional",
			categories: [ "Commercial" ],
			poster: "media/custom/scottsdale-community-college.jpg"
		},

		{
			youtube: "eW3EW8vkneg",
			title: "An Ernest Surprise (or Lack Thereof) | OFFICIAL TRAILER",
			categories: [ "Film" ],
			poster: "media/thumbnails/an-ernest-surprise-trailer-1536x864.jpg"
		},

		{
			youtube: "QuWth73uq0g",
			title: "Treestyle - Slowpoke [OFFICIAL MUSIC VIDEO]",
			categories: [ "Film", "Music Video" ],
			poster: "media/custom/treestyle-slowpoke.jpg"
		},

		{
			youtube: "JrLVSppPBuI",
			title: "The Making of a Village - Documentary",
			categories: [ "Commercial", "Film" ],
			poster: "media/thumbnails/making-of-a-village-1536x864.jpg"
		},

		{
			youtube: "6lvesdqmyUg",
			title: "ARTISANS WHO SOLVE - Bollinger Atelier",
			categories: [ "Commercial" ],
			poster: "media/thumbnails/bollinger-atelier-1536x864.jpg"
		},

		{
			youtube: "4dJxZEecXWI",
			title: "Holy Fawn Spec Promotional (Unofficial)",
			categories: [ "Commercial", "Music Video" ],
			poster: "media/custom/holy-fawn-spec-promo.jpg"
		},

		{
			youtube: "rn-_qyoueR0",
			title: "Mixed Feelings",
			categories: [ "Film" ],
			poster: "media/thumbnails/mixed-feelings-1536x864.jpg"
		},

		{
			youtube: "hnT83MrpaAs",
			title: "TheMedisin - Nep's Tune (Official Music Video)",
			categories: [ "Music Video" ],
			poster: "media/thumbnails/themedisin-neps-tune-1536x864.jpg"
		},

		{
			youtube: "ANzF8ZsLW7g",
			title: "S.I.N Dental Exocad Commercial Extended",
			categories: [ "Commercial" ],
			poster: "media/thumbnails/sin-dental-exocad-1536x864.jpg"
		},

		{
			youtube: "m8xWp-IuNvA",
			title: "Jah Harris - Family",
			categories: [ "Music Video" ],
			poster: "media/thumbnails/jah-harris-family-1536x864.jpg"
		},

		{
			youtube: "bbpLGVTVw-c",
			title: "Surgeon Documercial",
			categories: [ "Film", "Commercial" ],
			poster: "media/thumbnails/surgeon-documercial-1536x864.jpg"
		},

		{
			youtube: "aw6dorI5_qI",
			title: "TheMedisin - Pas D'amour Sur Pluton (No Love on Pluto Official Video)",
			categories: [ "Music Video" ],
			poster: "media/thumbnails/themedisin-pas-damour-1536x864.jpg"
		},

		{
			youtube: "fy1kOjMt8oY",
			title: "Treestyle - Has Been [OFFICIAL MUSIC VIDEO]",
			categories: [ "Music Video" ],
			poster: "media/thumbnails/treestyle-has-been-1536x864.jpg"
		}

	]
};
