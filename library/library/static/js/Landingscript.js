//TIME GREETING
const greeting = document.querySelector(".main-content p");
const hour = new Date().getHours();

if (hour < 12) greeting.textContent = "Good morning! Ready to explore books?";
else if (hour < 18)
  greeting.textContent = "Good afternoon! What will you read today?";
else greeting.textContent = "Good evening! Time to unwind with a good book.";

const text = "Welcome to Ubrary!";
let index = 0;
function typeEffect() {
  if (index < text.length) {
    document.querySelector(".main h1").textContent += text[index++];
    setTimeout(typeEffect, 100);
  }
}
typeEffect();
