<!DOCTYPE html>

<html lang="en">
	<head>
		<title>Age of Football</title>

		<link href="./css/bootstrap.min.css" rel="stylesheet" type="text/css">
		<link href="./css/menu.css" rel="stylesheet" type="text/css">

		<script type="text/javascript" src="./require.js"></script>

		<script type="text/javascript">
			module = {};

			require.config({
			    baseUrl: "",
			    paths: {
			        // the left side is the module ID,
			        // the right side is the path to
			        // the jQuery file, relative to baseUrl.
			        // Also, the path should NOT include
			        // the '.js' file extension. This example
			        // is using jQuery 1.9.0 located at
			        // js/lib/jquery-1.9.0.js, relative to
			        // the HTML page.
			        //io: "https://cdn.socket.io/socket.io-1.3.5.js"
			        jquery: "jquery-1.7.min",
			    }
			});

			var clearInput = function( id ) {
				console.log( "clearInput" );

				id.value = "";
			}

			require(["client/client_main"], function( client_main ) {
				
			});
		</script>


		<link rel="stylesheet" type="text/css" href="./css/arena.css" />
	</head>
	<body>

	<div id="arena">
		<div id="menu" class="row-fluid">

			<div id="team1data" class="span2">
				<img id="team1image" src="">
			</div>
			<div id="center" class="span8">

			</div>
			<div id="team2data" class="span2">
				<img id="team2image" src="">
			</div>	
		</div>	
			<canvas id="main">	</canvas>
		</div>
	</body>	

	<table id="game-table">

	</table>
</html>
