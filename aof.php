<!DOCTYPE html>

<html lang="en">
	<head>
		<title>Age of Football</title>

		<link href="./css/bootstrap.min.css" rel="stylesheet" type="text/css">

		<script type="text/javascript">
			var require = function() { };
		</script>

		<script type="text/javascript" src="./jquery-1.7.min.js"></script>
		<script type="text/javascript" src="/socket.io/socket.io.js"></script>
		<script type="text/javascript" src="./Vec2.js"></script>
		<script type="text/javascript" src="./Team.js"></script>
		<script type="text/javascript" src="./text.js"></script>
		<script type="text/javascript" src="./keyboard.js"></script>
		<script type="text/javascript" src="./dims.js"></script>
		<script type="text/javascript" src="./Act.js"></script>
		<script type="text/javascript" src="./Room.js"></script>
		<script type="text/javascript" src="./screen.js"></script>
		<script type="text/javascript" src="./Event.js"></script>
	
		<script type="text/javascript" src="./juego.js/util.js"></script>	
		<script type="text/javascript" src="./juego.js/image.js"></script>
		<script type="text/javascript" src="./juego.js/ScrollBox.js"></script>
		<script type="text/javascript" src="./juego.js/KDTree.js"></script>

		<script type="text/javascript" src="./client/clientEntity.js"></script>
		<script type="text/javascript" src="./client/clientMan.js"></script>
		<script type="text/javascript" src="./client/clientBall.js"></script>
		<script type="text/javascript" src="./client/clientZone.js"></script>
		<script type="text/javascript" src="./client/anim.js"></script>
		<script type="text/javascript" src="./client/Menu.js"></script>
		<script type="text/javascript" src="./client/MenuElement.js"></script>
		<script type="text/javascript" src="./client/SightLine.js"></script>
		<script type="text/javascript" src="./client/AOFScrollBox.js"></script>
		<script type="text/javascript" src="./client/client_main.js"></script>
		
		<style = type="text/css">
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
					<canvas id="main">
				</canvas>
			</div>
	</body>	
</html>
