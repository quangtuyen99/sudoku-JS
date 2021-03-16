// Load board game

const easy = [
    "6------7------5-2------1---362----81--96-----71--9-4-5-2---651---78----345-------", // Ma trận 9x9, với - là các khoảng trống cần điền vào
    "685329174971485326234761859362574981549618732718293465823946517197852643456137298" // Đáp án
];
const medium = [
    "--9-------4----6-758-31----15--4-36-------4-8----9-------75----3-------1--2--3--",
    "619472583243985617587316924158247369926531478734698152891754236365829741472163895"
];
const hard = [
    "-1-5-------97-42----5----7-5---3---7-6--2-41---8--5---1-4------2-3-----9-7----8--",
    "712583694639714258845269173521436987367928415498175326184697532253841769976352841"
];

// Tạo các biến
var timer;
var timeRemaining;
var lives;
var selectedNum;
var selectedTile;
var disableSelect;

window.onload = function() {
    // Bắt đầu khi bấm nút start
    id("start-btn").addEventListener("click", startGame);

    // Thêm sự kiện cho mỗi sớ cột bên phải
    for(let i = 0; i < id("number-container").children.length; i++) {
        id("number-container").children[i].addEventListener("click",function() {
            if(!disableSelect) {
                // Nếu số đã được chọn từ trước
                if(this.classList.contains("selected")) {
                    this.classList.remove("selected");
                    selectedNum = null;
                } else {
                    // bỏ chọn tất cả các số
                    for(let i = 0; i< 9; i++) {
                        id("number-container").children[i].classList.remove("selected");
                    }

                    // Chọn số và cập nhật biến
                    this.classList.add("selected");
                    selectedNum = this;
                    updateMove();
                }
            }
        });
    }
}

function startGame() {

    let board;
    // Chọn độ khó game
    if(id("diff-1").checked)
        board = easy[0];
    else if(id("diff-2").checked)
        board = medium[0];
    else 
        board = hard[0];

    // Set số mạng là 3 và có thể click chọn số trong bàn
    lives = 3;
    disableSelect = false;
    id("lives").textContent = "Mạng: 3"; // set Text

    // Tạo ra bàn chơi theo độ khó game
    generatedBoard(board);
    //Bắt đầu thời gian đếm
    startTimer();
    //Set theme dựa vào người chơi
    if(id("theme-1").checked) {
        qs("body").classList.remove("dark");
    } else {
        qs("body").classList.add("dark");
    }

    //Hiện các số bên phải
    id("number-container").classList.remove("hidden");
}

function generatedBoard(board) {
    clearPrevious(); // Xóa ván chơi trước

    let idCount = 0; // Tạo id của số trong bàn
    // Tạo 81 số
    for(let i =0; i< 81; i++) {
        // Tạo ra 1 phần tử pagragaph
        let tile = document.createElement("p");

        // Kiểm tra kí tự tại vị trí có phải là khoảng trắng không
        if(board.charAt(i) != "-") {
            // Gán số cho array
            tile.textContent = board.charAt(i);

        } else { // Nếu là khoảng trống
            // Tạo 1 event lắng nghe
            tile.addEventListener("click", function() {

                if(!disableSelect) {
                    // Nếu số được chọn
                    if(tile.classList.contains("selected")) {
                        // bỏ chọn
                        tile.classList.remove("selected");
                        selectedTile = null;
                    } else {
                        // bỏ chọn tất cả các số 
                        for(let i=0; i<81; i++) {
                            qsa(".tile")[i].classList.remove("selected");

                        }

                        // Cập nhật giá trị
                        tile.classList.add("selected");
                        selectedTile = tile;
                        updateMove();
                    }
                }
            });

        }

        tile.id = idCount; // Gán id cho số;
        idCount++;

        // Đưa tất cả số vào trong Class 
        tile.classList.add("tile");
        if((tile.id > 17 && tile.id < 27) || (tile.id > 44 && tile.id < 54)) { // Nếu các số này nằm ở rìa cạnh dưới 3 ô vuông nằm ngang đầu tiên sẽ tạo thành 1 cạnh
            tile.classList.add("bottomBorder");
        }
        if(((tile.id + 1) % 9 == 3) || ((tile.id + 1) % 9 == 6)) { // Nếu các số nằm rìa cạnh phải ô vuông
            tile.classList.add("rightBorder");
        }

        // Add các số vào bàn chơi
        id("board").appendChild(tile);
    }

}

function updateMove() {
    // Nếu số trong bàn và số trong cột được chọn
    if(selectedTile && selectedNum) {
        // Đặt số trong bàn thành số trong cột
        selectedTile.textContent = selectedNum.textContent;

        // Kiểm tra xem số trong bàn có phù hợp với đáp án không
        if(checkCorrect(selectedTile)) {
            // Bỏ chọn số
            selectedTile.classList.remove("selected");
            selectedNum.classList.remove("selected");

            //Kiểm tra nếu game hoàn thành
            if(checkDone()) {
                endGame();
            }

            // Clear số
            selectedNum = null;
            selectedTile = null;
        } else { // Nếu số được chọn không phù hợp
            disableSelect = true;

            // Số được chọn thành màu đỏ
            selectedTile.classList.add("incorrect");

            // Chạy hàm trong 1s
            setTimeout(function() {
                // Giảm số mạng
                lives --;
                // Nếu không còn mạng, kết thúc trò chơi 
                if(lives === 0) 
                    endGame();
                else {
                    //Cập nhật lại số mạng trong text
                    id("lives").textContent = "Mạng: " + lives;
                    disableSelect = false;
                }

                // 
                selectedTile.classList.remove("incorrect");
                selectedTile.classList.remove("selected");
                selectedNum.classList.remove("selected");

                // Clear kí tự trong bàn và clear giá trị được chọn bên cột phải
                selectedTile.textContent = "";
                selectedTile = null;
                selectedNum = null;
            },1000); 
        }
    }
}

function endGame() {
    // Dừng thời gian và không cho di chuyển
    disableSelect = true;
    clearTimeout(timer);

    //Hiện thông báo thắng hoặc thua
    if(lives === 0 || timeRemaining === 0) {
        id("lives").textContent = "Thua!";
    } else {
        id("lives").textContent = "Thắng!";
    }
}

function checkDone() {
    let tiles = qsa(".tile");
    for(let i = 0; i < tiles.length; i++) {
        if(tiles[i].textContent === "") 
            return false;
        
    }
    
    return true;
}

function checkCorrect(tile) {
    // Đặt 1 biến chứa lời giải dựa theo độ khó
    let solution;
    
    if(id("diff-1").checked)
        solution = easy[1];
    else if(id("diff-2").checked)
        solution = medium[1];
    else 
        solution = hard[1];

    // Kiểm tra xem số được chọn có đúng với kq
    if(solution.charAt(tile.id) === solution.textContent) return true;
    else return false;
}

function clearPrevious() {
    let tiles = qsa(".tile"); // Pass tất cả class tile vào array

    // Xóa từng tiles 
    for(let i = 0; i <tiles.length; i++) {
        tiles[i].remove();
    }

    // Nếu còn biến thời gian, xóa nó
    if(timer) {
        clearTimeout(timer);
    }

    // Bỏ chọn các số nằm cột bên phải
    for(let i = 0; i < id("number-container").children.length; i++) {
        id("number-container").children[i].classList.remove("selected");
    }

    // Xóa các số dược chọn trong bàn
    selectedTile = null;
    selectedNum = null;
}

function startTimer() {
    // Đặt thời gian dựa vào lựa chọn ng chơi
    if(id("time-1").checked) {
        timeRemaining = 300;
    } else if(id("time-2").checked) {
        timeRemaining = 600;
    } else timeRemaining = 900;

    // Đặt thời gian
    id("timer").textContent = timeConversion(timeRemaining);

    // Cập nhật thời gian mỗi giây
    timer = setInterval(function() {
        timeRemaining--;
        if(timeRemaining === 0) endGame();
        id("timer").textContent = timeConversion(timeRemaining);
    }, 1000);
}

// Chuyển thời gian từ số sang định dạng MM:SS
function timeConversion(time) {
    let minute = Math.floor(time / 60);
    if(minute < 10) minute = "0" + minute;


    let second = time % 60;
    if(second < 10) second = "0" + second;

    return minute + ":" + second;
}


// Helper function
// Tìm theo id
function id(id) {
    return document.getElementById(id);
}

function qs(selector) {
    return document.querySelector(selector);
}

function qsa(selector) {
    return document.querySelectorAll(selector);
}

