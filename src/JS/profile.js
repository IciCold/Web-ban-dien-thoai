const userName = document.querySelector('.user-Name');

const currentUser = JSON.parse(localStorage.getItem("currentUser")) || false;
console.log(currentUser);
if(userName && currentUser){
    userName.textContent = currentUser.userName;
}

