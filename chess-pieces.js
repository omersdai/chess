const PAWN_HTML = `<svg
class="chess-piece"
version="1.1"
xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink"
x="0px"
y="0px"
viewBox="0 0 300 300"
style="enable-background: new 0 0 300 300"
xml:space="preserve"
>
<style type="text/css">
  <!-- .chess-piece{
    height: $size;
    width: $size;
    stroke-miterlimit: 10;
  }
  
  .white {
    fill: white;
    stroke: black;
  }
  .black {
    fill: black;
    stroke: white;
  } -->
</style>
<g id="base">
  <path
    d="M271.63,269.61c-1.28,0-6.19,0-13.36,0c0,0-0.34-11.93-9.57-16.21c-9.23-4.28-19.36-10.24-19.36-14.29
c0-3.2,0-11.76,0-15.25l7.24,0.05c0,0,11.63-0.15,11.63-13.66s-11.63-13.66-11.63-13.66H150H63.41c0,0-11.63,0.15-11.63,13.66
s11.63,13.66,11.63,13.66l7.24-0.05c0,3.49,0,12.05,0,15.25c0,4.05-10.13,10.02-19.36,14.29c-9.23,4.28-9.57,16.21-9.57,16.21
c-1.78,0-3.44,0-4.91,0c-5.16,0-8.28,0-8.44,0c-6.98,0-6.75,8.1-6.75,8.1V300h127.71h1.35h127.71v-22.29
C278.39,277.71,278.61,269.61,271.63,269.61z"
  />
</g>
<g id="pawn-head">
  <path
    d="M207.33,160.8c0-12.05,0-40.29,0-40.29H150H92.67c0,0,0,28.24,0,40.29c0,12.05-26.78,35.8-26.78,35.8H150
h84.11C234.11,196.6,207.33,172.85,207.33,160.8z"
  />
  <path d="M150,55.37" />
  <path
    d="M204.89,104.66H175.2c17.9-9.17,30.17-27.8,30.17-49.29C205.37,24.79,180.58,0,150,0S94.63,24.79,94.63,55.37
c0,21.5,12.26,40.12,30.17,49.29H95.11c-14.71,0-13.95,10.08-13.95,10.08s-0.76,10.08,13.95,10.08H150h54.89
c14.71,0,13.95-10.08,13.95-10.08S219.6,104.66,204.89,104.66z"
  />
</g>
</svg>
`;

const ROOK_HTML = `<svg
class="chess-piece" 
version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 300 300" style="enable-background:new 0 0 300 300;" xml:space="preserve">
		<style type="text/css">
		  <!-- .chess-piece{
			height: $size;
			width: $size;
			stroke-miterlimit: 10;
		  }
		  
		  .white {
			fill: white;
			stroke: black;
		  }
		  .black {
			fill: black;
			stroke: white;
		  } -->
		</style>
<g id="rook-head">
	<path d="M208.5,176.38c0-8.64,0-93.02,0-93.02h-63.79h-1.53H79.39c0,0,0,84.39,0,93.02s-12.96,20.21-12.96,20.21h76.75
		h1.52h76.75C221.46,196.59,208.5,185.02,208.5,176.38z"/>
	<path d="M207.98,60.88L207.98,60.88l-63.51,0h-1.04H79.91v0c0,0-12.96-0.24-12.96,11.24c0,0,0,0,0,0s0,0,0,0
		c0,11.47,12.96,11.24,12.96,11.24h63.51h1.04h63.51c0,0,12.96,0.24,12.96-11.24c0,0,0,0,0,0s0,0,0,0
		C220.93,60.65,207.98,60.88,207.98,60.88z"/>
	<path d="M222.43,0h-13.37h-13.37c-2.17,0-3.92,1.76-3.92,3.92v17.67h-30.53V3.92c0-2.17-1.76-3.92-3.92-3.92h-13.37
		h-13.37c-2.17,0-3.92,1.76-3.92,3.92v17.67H96.12V3.92C96.12,1.76,94.36,0,92.2,0H78.83H65.45c-2.17,0-3.92,1.76-3.92,3.92v17.67
		c0,0,0,12.71,0,22.35s17.29,16.94,17.29,16.94h65.12h65.12c0,0,17.29-7.29,17.29-16.94s0-22.35,0-22.35V3.92
		C226.36,1.76,224.6,0,222.43,0z"/>
</g>
<g id="base">
	<path d="M265.57,269.61c-1.28,0-6.19,0-13.36,0c0,0-0.34-11.93-9.57-16.21c-9.23-4.28-19.36-10.24-19.36-14.29
		c0-3.2,0-11.76,0-15.25l7.24,0.05c0,0,11.63-0.15,11.63-13.66s-11.63-13.66-11.63-13.66h-86.58H77.69H57.35
		c0,0-11.63,0.15-11.63,13.66s11.63,13.66,11.63,13.66l7.24-0.05c0,3.49,0,12.05,0,15.25c0,4.05-10.13,10.02-19.36,14.29
		c-9.23,4.28-9.57,16.21-9.57,16.21c-1.78,0-3.44,0-4.91,0c-5.16,0-8.28,0-8.44,0c-6.98,0-6.75,8.1-6.75,8.1V300h127.71h1.35h127.71
		v-22.29C272.33,277.71,272.55,269.61,265.57,269.61z"/>
</g>
</svg>
`

const KNIGHT_HTML = `<svg 
		class="chess-piece"
		version="1.1"
		xmlns="http://www.w3.org/2000/svg"
		xmlns:xlink="http://www.w3.org/1999/xlink"
		x="0px"
		y="0px"
		viewBox="0 0 300 300"
		style="enable-background: new 0 0 300 300"
		xml:space="preserve"
		>
		<style type="text/css">
		  <!-- .chess-piece{
			height: $size;
			width: $size;
			stroke-miterlimit: 10;
		  }
		  
		  .white {
			fill: white;
			stroke: black;
		  }
		  .black {
			fill: black;
			stroke: white;
		  } -->
		</style>
<g id="knight-head">
	<g>
		<path d="M84.5,196.6c0,0-27.1-43.6-27.1-90.2S79.2,39,110.1,20.4s98.8-9.6,98.8-9.6s-3.2,2.7-8.3,13.2
			s-33.1,59.3-33.1,59.3L84.5,196.6z"/>
		<path d="M84.5,196.6c0,0-10.4-44.3-3.8-75.5s14-48.8,23.5-60.3s28.9-29.7,38-36S178.8,0,178.8,0s2.9,10.5,2,15.4
			c-1,4.9-3.2,11-3.2,11s13,6.9,16.2,10.3c3.2,3.4,16.4,16.9,18.4,20.3s4.4,11,7.1,15.7s23.8,31.9,23.8,31.9s3.2,12.5-2,17.4
			c-5.1,4.9-6.7,9.4-21,9.1c0,0-10.7-11.9-15.8-14.9c0,0-14.9-2.4-20.6-4.4c-5.7-2-18.2-6.6-24.3-13.6c0,0-4.1,10.1-4.1,15.4
			c0,5.3,0.6,13.2,3.1,18.2c2.6,5,33.5,35.1,37.5,39.9c0,0,7.5,6.4,10.9,11.9c3.3,5.5,7.5,12.8,7.5,12.8L84.5,196.6L84.5,196.6z"/>
		<path d="M150.7,71.8c0,0-0.7,5.5,1.1,12.3s7.5,14.2,7.5,14.2"/>
		<path d="M126.8,196.6L110.1,151c0,0-9.1-22.8-8.6-40.7s6-46,12.6-60.4"/>
		<path d="M195.6,69.3h-5.4c0,0-7.5-3.6-7.9-5.7c0,0,4.6-1.1,7.4-1s5.9,1.3,6.7,2.4C197.2,66.1,197.7,68,195.6,69.3z"/>
		<path d="M236.1,127c0,0-8.1-3.9-11-8.4"/>
		<line x1="195.6" y1="69.3" x2="200.5" y2="74"/>
	</g>
</g>
<g id="base">
	<path d="M272.3,269.6c-1.3,0-6.2,0-13.4,0c0,0-0.3-11.9-9.6-16.2c-9.2-4.3-19.4-10.2-19.4-14.3c0-3.2,0-11.8,0-15.2
		l7.2,0.1c0,0,11.6-0.1,11.6-13.7s-11.6-13.7-11.6-13.7h-86.6H64.1c0,0-11.6,0.1-11.6,13.7s11.6,13.7,11.6,13.7l7.2-0.1
		c0,3.5,0,12.1,0,15.2c0,4.1-10.1,10-19.4,14.3c-9.2,4.3-9.6,16.2-9.6,16.2c-1.8,0-3.4,0-4.9,0c-5.2,0-8.3,0-8.4,0
		c-7,0-6.8,8.1-6.8,8.1V300H150h1.4h127.7v-22.3C279.1,277.7,279.3,269.6,272.3,269.6z"/>
</g>
</svg>
`

const BISHOP_HTML = `<svg 
class="chess-piece"
version="1.1"
xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink"
x="0px"
y="0px"
viewBox="0 0 300 300"
style="enable-background: new 0 0 300 300"
xml:space="preserve"
>
<style type="text/css">
  <!-- .chess-piece{
  height: $size;
  width: $size;
  stroke-miterlimit: 10;
  }
  
  .white {
  fill: white;
  stroke: black;
  }
  .black {
  fill: black;
  stroke: white;
  } -->
</style>
<g id="bishop-head">
<path d="M163.7,33.23c3.3-3.53,5.34-8.26,5.34-13.48C169.05,8.84,160.2,0,149.29,0s-19.75,8.84-19.75,19.75
c0,5.22,2.04,9.95,5.35,13.48c-7.89,1.94-14.97,5.38-21.24,9.89c9.97,9.9,25.95,26.09,29.32,31.45
c4.98,7.91,12.24,17.42,12.24,39.46h-11.37c0,0-1.94-12.73-12.99-27.69c-7.32-9.91-20.81-24.03-29.09-32.43
C85.91,71.72,77.9,96.63,77.9,115.13c0,32.16,10.72,81.46,10.72,81.46h60.37h0.61h60.37c0,0,10.72-49.3,10.72-81.46
C220.69,86.48,201.49,42.5,163.7,33.23z"/>
</g>
<g id="base">
<path d="M270.92,269.61c-1.28,0-6.19,0-13.36,0c0,0-0.34-11.93-9.57-16.21c-9.23-4.28-19.36-10.24-19.36-14.29
c0-3.2,0-11.76,0-15.25l7.24,0.05c0,0,11.63-0.15,11.63-13.66s-11.63-13.66-11.63-13.66h-86.58H83.04H62.7
c0,0-11.63,0.15-11.63,13.66s11.63,13.66,11.63,13.66l7.24-0.05c0,3.49,0,12.05,0,15.25c0,4.05-10.13,10.02-19.36,14.29
c-9.23,4.28-9.57,16.21-9.57,16.21c-1.78,0-3.44,0-4.91,0c-5.16,0-8.28,0-8.44,0c-6.98,0-6.75,8.1-6.75,8.1V300h127.71h1.35h127.71
v-22.29C277.68,277.71,277.9,269.61,270.92,269.61z"/>
</g>
</svg>
`

const QUEEN_HTML = `<svg 
class="chess-piece"
version="1.1"
xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink"
x="0px"
y="0px"
viewBox="0 0 300 300"
style="enable-background: new 0 0 300 300"
xml:space="preserve"
>
<style type="text/css">
  <!-- .chess-piece{
  height: $size;
  width: $size;
  stroke-miterlimit: 10;
  }
  
  .white {
  fill: white;
  stroke: black;
  }
  .black {
  fill: black;
  stroke: white;
  } -->
</style>
<path d="M271.97,269.61c-1.28,0-6.19,0-13.36,0c0,0-0.34-11.93-9.57-16.21c-9.23-4.28-19.36-10.24-19.36-14.29
c0-3.2,0-11.76,0-15.25l7.24,0.05c0,0,11.63-0.15,11.63-13.66s-11.63-13.66-11.63-13.66h-86.58H84.08H63.75
c0,0-11.63,0.15-11.63,13.66s11.63,13.66,11.63,13.66l7.24-0.05c0,3.49,0,12.05,0,15.25c0,4.05-10.13,10.02-19.36,14.29
c-9.23,4.28-9.57,16.21-9.57,16.21c-1.78,0-3.44,0-4.91,0c-5.16,0-8.28,0-8.44,0c-6.98,0-6.75,8.1-6.75,8.1V300h127.71h1.35h127.71
v-22.29C278.73,277.71,278.95,269.61,271.97,269.61z"/>
<path d="M268.47,24.89c-5.79-2.62-12.6-0.05-15.22,5.74c-2.46,5.43-0.35,11.76,4.7,14.69l-44.45,55.85
c-1.4-0.25-2.8-0.5-4.22-0.73l-2.52-71.63c5.8,0.65,11.26-3.18,12.52-9.01c1.34-6.21-2.61-12.33-8.82-13.67
c-6.21-1.34-12.33,2.61-13.67,8.82c-1.26,5.82,2.14,11.57,7.69,13.37l-33.41,67.46c-0.59-0.05-1.17-0.1-1.74-0.15l-18.36-72.67
c5.8-0.59,10.34-5.49,10.34-11.44c0-6.35-5.15-11.5-11.5-11.5c-6.35,0-11.5,5.15-11.5,11.5c0,5.96,4.53,10.86,10.34,11.44
l-18.37,72.7c-0.22,0.02-0.45,0.04-0.68,0.06L96.2,28.3c5.55-1.8,8.95-7.54,7.69-13.37c-1.34-6.21-7.46-10.16-13.67-8.82
c-6.21,1.34-10.16,7.46-8.82,13.67c1.26,5.82,6.72,9.66,12.52,9.01l-2.51,71.5c-1.45,0.24-2.89,0.48-4.32,0.74L42.73,45.31
c5.05-2.93,7.16-9.26,4.7-14.69c-2.62-5.79-9.43-8.36-15.22-5.74c-5.79,2.62-8.36,9.43-5.74,15.22c2.46,5.43,8.6,8.03,14.13,6.17
l11.66,65.1c-4.58,2.66-7.27,5.7-7.14,9.18c0.78,21.54,25.12,41.65,27.08,53.61c1.96,11.97-5.49,22.42-5.49,22.42h82.28h1.95h82.28
c0,0-7.46-10.45-5.49-22.42c1.96-11.97,26.3-32.07,27.08-53.61c0.12-3.31-2.3-6.21-6.46-8.77l11.73-65.51
c5.53,1.86,11.68-0.74,14.13-6.17C276.83,34.32,274.26,27.5,268.47,24.89z"/>
<line x1="72.21" y1="174.17" x2="227.72" y2="174.17"/>
</svg>
`

const KING_HTML = `<svg 	
class="chess-piece"
version="1.1"
xmlns="http://www.w3.org/2000/svg"
xmlns:xlink="http://www.w3.org/1999/xlink"
x="0px"
y="0px"
viewBox="0 0 300 300"
style="enable-background: new 0 0 300 300"
xml:space="preserve"
>
<style type="text/css">
  <!-- .chess-piece{
  height: $size;
  width: $size;
  stroke-miterlimit: 10;
  }
  
  .white {
  fill: white;
  stroke: black;
  }
  .black {
  fill: black;
  stroke: white;
  } -->
</style>
<path d="M272.52,269.61c-1.28,0-6.19,0-13.36,0c0,0-0.34-11.93-9.57-16.21c-9.23-4.28-19.36-10.24-19.36-14.29
c0-3.2,0-11.76,0-15.25l7.24,0.05c0,0,11.63-0.15,11.63-13.66s-11.63-13.66-11.63-13.66h-86.58H84.63H64.3
c0,0-11.63,0.15-11.63,13.66s11.63,13.66,11.63,13.66l7.24-0.05c0,3.49,0,12.05,0,15.25c0,4.05-10.13,10.02-19.36,14.29
c-9.23,4.28-9.57,16.21-9.57,16.21c-1.78,0-3.44,0-4.91,0c-5.16,0-8.28,0-8.44,0c-6.98,0-6.75,8.1-6.75,8.1V300h127.71h1.35h127.71
v-22.29C279.28,277.71,279.5,269.61,272.52,269.61z"/>
<path d="M169.47,14.8h-9.51V3.81c0-2.11-1.74-3.81-3.88-3.81h-10.37c-2.14,0-3.88,1.71-3.88,3.81V14.8h-9.51
c-2.14,0-3.88,1.71-3.88,3.81v6.57c0,2.11,1.74,3.81,3.88,3.81h9.51v29h18.13V29h9.51c2.14,0,3.88-1.71,3.88-3.81v-6.57
C173.35,16.5,171.62,14.8,169.47,14.8z"/>
<path d="M272.68,62.53h-96.17c-1.75,0-3.16-1.48-3.16-3.3v-1.87c0-1.82-1.42-3.3-3.16-3.3H131.6
c-1.75,0-3.16,1.48-3.16,3.3v1.87c0,1.82-1.42,3.3-3.16,3.3H29.11c-2.49,0-4.01,2.87-2.67,5.07l53.42,87.78h-5.84
c0,0-22.59,2.84-22.59,20.6c0,17.77,22.59,20.6,22.59,20.6h153.75c0,0,22.59-2.84,22.59-20.6c0-17.77-22.59-20.6-22.59-20.6h-5.84
l53.42-87.78C276.69,65.41,275.18,62.53,272.68,62.53z"/>
<line x1="79.85" y1="155.38" x2="221.93" y2="155.38"/>
</svg>
`