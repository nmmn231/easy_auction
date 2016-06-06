var config = {
  apiKey: "AIzaSyAEUACu_FQKgy_gjxFKaL1AK0ZqykkCOxw",
  authDomain: "web-assign6.firebaseapp.com",
  databaseURL: "https://web-assign6.firebaseio.com",
  storageBucket: "web-assign6.appspot.com",
};
firebase.initializeApp(config);
ImageDealer.REF = firebase;
var currentUser ;
var fbProvider = new firebase.auth.FacebookAuthProvider();
var items = firebase.database().ref("items");


/*
    分為三種使用情形：
    1. 初次登入，改變成登入狀態
    2. 已為登入狀態，reload 網站照樣顯示登入狀態
    3. 未登入狀態

    登入/當初狀態顯示可使用下方 logginOption function
*/

function saveItems(title, price, descrip, pic) {
  items.push({"title":title, "price": parseInt(price), "descrip":descrip, "photo":pic, "userTime": new Date($.now()).toLocaleString()});
}

function showAllItems() {
  items.on("value", readItems);
}
showAllItems();

function viewAllItems() {
  items.once("value", readItems);
}

function readItems(snapshot) {
  var allData = snapshot.val();
  $("#items").empty();
  for (var itemData in allData){
    var itemView = createItems(allData[itemData],itemData);
    $("#items").append(itemView);
  }
}

function createItems(itemData,key) {
  var picPart = createPic(itemData.imgD, key);
  var wordPart = createIntro(itemData.title, itemData.price, "anonymous");
  var itemView = $("<div>",{
    class: "sale-item",
  }).append(picPart).append(wordPart);
  return itemView;
}

function createPic(imgD, key) {
  var picNode = picBack(imgD).append($("<div>",{class: "white-mask"}).append(
    $("<div>",{class: "option"}).append(
      $("<h6>", {text: "view"})
    ).append($("<h6>", {text: "edit", on:{
          click: function (e) {
            nowItem = key;
            var data = getItemByURL("items/"+ key);
            data.once("value", function (snapshot) {
              updateModal(e, snapshot.val());
            })
          }
        }
  }))
  ));
  return picNode;
}

function picBack(imgD) {
  //var bb = new Blob([imgD],{type:'image/jpeg'})
  //var shortURL = URL.createObjectURL(bb);
  //console.log(shortURL);
  return $("<div>",{
    class: "pic",
  }).css("background-image", 'url('+ imgD + ')');
}

function createIntro(title, price, author) {
  return $("<div>", {class: "word"}).append(
    $("<div>", {class: "name-price"}).append(
      $("<p>",{text: title})
    ).append(
      $("<p>",{text: '$' + price})
    )
  ).append(
    $("<div>", {class: "seller"}).append(
      $("<a>",{href: "#", text: author})
    )
  )
}

$("#signin").click(function () {
  firebase.auth().signInWithPopup(fbProvider).then(function(result){
    // 登入後的頁面行為
    logginOption(true);
  }).catch(function(error){
  var errorCode = error.code;
  var errorMessage = error.message;
  console.log(errorCode,errorMessage);
  });
});

$("#signout").click(function () {
  firebase.auth().signOut().then(function() {
    // 登出後的頁面行為
    logginOption(false);
  },function (error) {
  console.log(error.code);
  }); 
});


$("#submitData").click(function () {
    // 上傳新商品
  var dataArr = $("#item-info").serializeArray();
  var picFile = $("#picData")[0].files[0];
  var picTrans = new FileReader();
  if (dataArr[0].value != null && dataArr[1].value != null && dataArr[2].value != null && picFile ) {
    //check if it is picture(not yet)

    picTrans.readAsDataURL(picFile);
    picTrans.onloadend = (function (imge) {return function (e) {
        imge.src = e.target.result;
        saveItems(dataArr[0].value, dataArr[1].value, dataArr[2].value, e.target.result);
    }})(picFile);
    $("#upload-modal").modal('hide');
  }
});


$("#editData").click(function () {
    // 編輯商品資訊
})

$("#removeData").click(function () {
    //刪除商品
})


/*
    商品按鈕在dropdown-menu中
    三種商品篩選方式：
    1. 顯示所有商品
    2. 顯示價格高於 NT$10000 的商品
    3. 顯示價格低於 NT$9999 的商品

*/

function selectExpItems() {
  items.orderByChild("price").startAt(10000).on("value", readItems);
}

function selectCheapItems() {
  items.orderByChild("price").endAt(9999).on("value", readItems);
}

$(".dropdown-menu > li > a:nth-of-type(1)").click(function (event) {
  viewAllItems();
});

$(".dropdown-menu > li > a:nth-of-type(2)").click(function (event) {
  selectExpItems(event);
});

$(".dropdown-menu > li > a:nth-of-type(3)").click(function (event) {
  selectCheapItems();
});


function logginOption(isLoggin) {
  if (isLoggin) {
    $("#upload").css("display","block");
    $("#signin").css("display","none");
    $("#signout").css("display","block");
  }else {
    $("#upload").css("display","none");
    $("#signin").css("display","block");
    $("#signout").css("display","none");
  }
}


function reProduceAll(allItems) {
    /*
    清空頁面上 (#item)內容上的東西。
    讀取爬回來的每一個商品
    */

  /*
    利用for in存取
  
  for (var  in ) {

    produceSingleItem();
  }
  */
}
// 每點開一次就註冊一次
function produceSingleItem(sinItemData){
  /*
    抓取 sinItemData 節點上的資料。
    若你的sinItemData資料欄位中並沒有使用者名稱，請再到user節點存取使用者名稱
    資料齊全後塞進item中，創建 Item 物件，並顯示到頁面上。
  */

  firebase.database().ref().once("",function () {
    $("#items").append();

      /*
        用 ViewModal 填入這筆 item 的資料
        呼叫 ViewModal callImage打開圖片
        創建一個 MessageBox 物件，將 Message 的結構顯示上 #message 裡。
      */


      $("#message").append();

      /*
        判斷使用者是否有登入，如果有登入就讓 #message 容器顯示輸入框。
        在 MessageBox 上面註冊事件，當 submit 時將資料上傳。
      */
      if (currentUser) {
        $("#message").append(messBox.inputBox);

        messBox.inputBox.keypress(function (e) {
          if (e.which == 13) {
            e.preventDefault();

            /*
            取得input的內容 $(this).find("#dialog").val();
            清空input的內容 $(this).find("#dialog").val("");
            */
          }
        });
      }

    /*
    從資料庫中抓出message資料，並將資料填入MessageBox
    */
      // firebase.database().ref().orderBy.("",function(data) {

      // });
    });

    /*
    如果使用者有登入，替 editBtn 監聽事件，當使用者點選編輯按鈕時，將資料顯示上 uploadModal。
    */

}

function generateDialog(diaData, messageBox) {


}
