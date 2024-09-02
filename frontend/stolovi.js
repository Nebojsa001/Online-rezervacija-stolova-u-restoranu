let orderDiv;
let closeBtn;
const tableInfo = {
  1: { waiter: "Marko", sjedecihMjesta: 8 },
  2: { waiter: "Ana", sjedecihMjesta: 8 },
  3: { waiter: "Ivana", sjedecihMjesta: 8 },
  4: { waiter: "Jovan", sjedecihMjesta: 8 },
  5: { waiter: "Nikola", sjedecihMjesta: 8 },
  6: { waiter: "Mila", sjedecihMjesta: 4 },
  7: { waiter: "Petar", sjedecihMjesta: 4 },
  8: { waiter: "Lena", sjedecihMjesta: 4 },
  9: { waiter: "Stefan", sjedecihMjesta: 2 },
  10: { waiter: "Milica", sjedecihMjesta: 2 },
  11: { waiter: "Milica", sjedecihMjesta: 2 },
  12: { waiter: "Milica", sjedecihMjesta: 2 },
};

function showTableInfo(tableNumber) {
  // const info = tableInfo[tableNumber];
  // console.log(info);

  if (orderDiv) {
    orderDiv.classList.remove("display-flex");
  }

  orderDiv = document.getElementById(`order${tableNumber}`);

  orderDiv.classList.add("display-flex");
  orderDiv.innerHTML = `        <span id="close-btn">X</span><br />
        Rezervišite svoj sto
        <a href="#">REZERVISI</a>`;

  closeBtn = document.getElementById("close-btn");
  console.log(closeBtn);

  closeBtn.addEventListener("click", function () {
    orderDiv.classList.remove("display-flex");
  });
}
