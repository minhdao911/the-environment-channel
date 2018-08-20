var btn =  document.getElementsByName('radio-btn');

var imgArray = ["1.png","2.gif","3.png"];

for ( let i =0 ; i < btn.length; i++) {
    btn[i].onclick = function(){
        document.querySelector(".featured-images").style.backgroundImage = `url('other/images/${imgArray[i]}')`
    }
}
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}
