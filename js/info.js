function displayGuide() {
  const item = document.querySelectorAll(".feature");
  const content = document.querySelectorAll(".content");

  item.forEach((cur, ind) => {
    cur.addEventListener("click", function () {
      let showDiv = "";
      content[ind].style.display === "block"
        ? (showDiv = "none")
        : (showDiv = "block");
      content.forEach((con) => (con.style.display = "none"));
      content[ind].style.display = `${showDiv}`;
    });
  });
}
displayGuide();
