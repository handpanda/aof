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

		<style type="text/css">
			html {
			  width:  100%;
			  height: 100%;
			  margin: 0px;
			}
			body {
				background-color: #000;
				color: #fff;
				font-size: 28px;
				font-weight: bold;
				width:  100%;
		  		height: 100%;
		  		margin: 0px;
				padding: 0;
				font-family: sans-serif;
				text-align: center;
			}
			#log {
				position: absolute;
				margin-bottom: 100px;
				z-index: 0;
			}
			#log ul {
				padding: 0;
				margin: 0;
			}
			#log ul li {
				list-style-type: none;
			}
			#arena {
				background-color: black;
			    padding-left: 0;
			    padding-right: 0;
					margin-left: auto;
					margin-right: auto;
			    display: inline-block;
				z-index: 100;
			}
			#console {
				background-color: black;
				color: white;
				border-top:1px solid white;
				position: fixed;
				bottom: 0;
				width: 100%;
				font-size: 18px;
			}
			#console input {
				width: 100%;
				background-color: inherit;
				color: inherit;
				font-size: inherit;
			}
			#arena { 
				position:relative;
			}
			#arena canvas {
				position:absolute; 
				top:0; 
				left:0; 
				z-index: -1;
			}
			#arena menu {
				position:absolute; 
				top:0; 
				left:0; 
				z-index: 0;
			}			
			.buffer { 
				margin-top:20px; 
				margin-left:5px; 
				margin-right:5px; 
			}
		</style>
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

	<div id="game-list">
		<table>
			<tr>
				<td>Name</td>
				<td>Score</td>
				<td>Time</td>
			</tr>
			<tr>
				<td>808</td>
				<td>DNI 1 - 3 SWE</td>
				<td>44:45</td>
			</tr>
		</table>
	</div>
</html>
