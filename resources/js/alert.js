export function alert(str){
  let alert = document.createElement('div')
  alert.classList.add('alert')
  alert.innerHTML = `<p>${str}</p>`
  document.body.appendChild(alert)
  setTimeout(()=>document.body.removeChild(alert),2000)
}
