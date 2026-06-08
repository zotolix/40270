let botones= document.getElementsByTagName("button")
let resultado = document.getElementById("resultado")

for (const key in botones){
    if (!Object.prototype.hasOwnProperty.call(botones, key)) continue;
    const boton = botones[key];
    console.log(boton)
    boton.addEventListener("click", pinta)
}

function pinta(e){
    resultado.value += e.target.innerText
}