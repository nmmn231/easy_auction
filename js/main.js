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
var users = firebase.database().ref("users");
var massages = firebase.database().ref("massages");

var uploadmodal = new UploadModal($("#upload-modal"));
var viewmodal = new ViewModal($("#view-modal"));


/*
    分為三種使用情形：
    1. 初次登入，改變成登入狀態
    2. 已為登入狀態，reload 網站照樣顯示登入狀態
    3. 未登入狀態

    登入/當初狀態顯示可使用下方 logginOption function
*/

firebase.auth().onAuthStateChanged(function (user) {
  if(user){
    logginOption(true);
    currentUser = user;
    reProduceAll();
  }else{
    logginOption(false);
    currentUser = user;
    reProduceAll();
  }
});

$("#signin").click(function () {
  firebase.auth().signInWithPopup(fbProvider).then(function(result){
    // 登入後的頁面行為
    var fbUser = {};
    fbUser["/users/"+result.user.uid+"/name"]= result.user.displayName;
    fbUser["/users/" + result.user.uid +"/photoURL"]= result.user.photoURL;
    firebase.database().ref().update(fbUser);
    
  }).catch(function(error){
  var errorCode = error.code;
  var errorMessage = error.message;
  console.log(errorCode,errorMessage);
  });
});

$("#signout").click(function () {
  firebase.auth().signOut().then(function() {
    // 登出後的頁面行為
    
  },function (error) {
  console.log(error.code);
  }); 
});


$("#submitData").click(function () {
    // 上傳新商品
  var dataArr = $("#item-info").serializeArray();
  var picFile = $("#picData")[0].files[0];
  if (dataArr[0].value != null && dataArr[1].value != null && dataArr[2].value != null && picFile ) {
    //check if it is picture(not yet)
    uploadmodal.itemKey = items.push({"title":dataArr[0].value, "price": parseInt(dataArr[1].value), "descrip":dataArr[2].value, "userTime": new Date($.now()).toLocaleString(), "seller":currentUser.uid, "sellerName":currentUser.displayName}).key;
  }
  var sellthings = {};
  sellthings["/users/"+ currentUser.uid +"/sellItems/" + uploadmodal.itemKey]= true;
  firebase.database().ref().update(sellthings);

  uploadmodal.submitPic(currentUser.uid);

});


$("#editData").click(function () {
  // 編輯商品資訊
  var dataArr = $("#item-info").serializeArray();
  var picFile = $("#picData")[0].files[0];
  if (dataArr[0].value != null && dataArr[1].value != null && dataArr[2].value != null ) {
    //check if it is picture(not yet)
    var newData = {};
    newData["/items/" + uploadmodal.itemKey +"/title"] = dataArr[0].value;
    newData["/items/" + uploadmodal.itemKey +"/price"] = parseInt(dataArr[1].value);
    newData["/items/" + uploadmodal.itemKey +"/descrip"] = dataArr[2].value;
    firebase.database().ref().update(newData);
    if(picFile){
      uploadmodal.submitPic(currentUser.uid); 
    }else{
      $("#upload-modal").modal("hide");
    }
      
    }

  })



$("#removeData").click(function () {
    //刪除商品
    firebase.database().ref("/items/" + uploadmodal.itemKey +"/" ).remove();
    uploadmodal.deletePic(currentUser.uid);
})


/*
    商品按鈕在dropdown-menu中
    三種商品篩選方式：
    1. 顯示所有商品
    2. 顯示價格高於 NT$10000 的商品
    3. 顯示價格低於 NT$9999 的商品

*/

$("#selectAll").click(function () {
  reProduceAll();
});

$("#selectExpensive").click(function () {
  items.orderByChild("price").startAt(10000).on("value", function(data){
    $("#items").empty();
    //利用for in存取
    var allItems = data.val();
    for (var itemKey in allItems ){
      allItems[itemKey].itemKey = itemKey;
      produceSingleItem(allItems[itemKey]);
    }
  });
});

$("#selectCheap").click(function () {
  items.orderByChild("price").endAt(9999).on("value", function(data){
    $("#items").empty();
    //利用for in存取
    var allItems = data.val();
    for (var itemKey in allItems ){
      allItems[itemKey].itemKey = itemKey;
      produceSingleItem(allItems[itemKey]);
    }
  });
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


function reProduceAll() {
  /*
  清空頁面上 (#item)內容上的東西。
  讀取爬回來的每一個商品
  */
  $("#items").empty();
  firebase.database().ref("items").once("value", function(data){
    //利用for in存取
    var allItems = data.val();
    for (var itemKey in allItems ){
      allItems[itemKey].itemKey = itemKey;
      produceSingleItem(allItems[itemKey]);
    }
  });  
}

// 每點開一次就註冊一次
function produceSingleItem(sinItemData){
  /*
    抓取 sinItemData 節點上的資料。
    若你的sinItemData資料欄位中並沒有使用者名稱，請再到user節點存取使用者名稱
    資料齊全後塞進item中，創建 Item 物件，並顯示到頁面上。
  */
  var product = new Item({title: sinItemData.title, price: parseInt(sinItemData.price), itemKey: sinItemData.itemKey, seller: sinItemData.seller, sellerName: sinItemData.sellerName}, currentUser);
  $("#items").append(product.dom);

  /*
    用 ViewModal 填入這筆 item 的資料
    呼叫 ViewModal callImage打開圖片
    創建一個 MessageBox 物件，將 Message 的結構顯示上 #message 裡。
  */

  product.viewBtn.click(function(){
    viewmodal.writeData(sinItemData);
    viewmodal.callImage(sinItemData.itemKey, sinItemData.seller);
  
    var messBox = new MessageBox(currentUser, product.itemKey);  
    $("#message").append(messBox.dom);
    $("#message").append(messBox.inputBox);
    firebase.database().ref("massages/" + sinItemData.itemKey).on("value", function(data){
    messBox.refresh();
    //利用for in存取
    var allItems = data.val();
    for (var itemKey in allItems ){
      allItems[itemKey].itemKey = itemKey;
      messBox.addDialog(allItems[itemKey]);
    }
  });
 
    messBox.inputBox.keypress(function(event){
      if(event.which ==13){
        //messBox.addDialog({message: messBox.inputBox.find("#dialog").val(), time:new Date().getTime(), name: currentUser.displayName, picURL: currentUser.photoURL});
        var chat = {};
        var curTime =new Date().getTime();
        chat["/massages/" + sinItemData.itemKey + "/" + curTime + "/message"]  = messBox.inputBox.find("#dialog").val();
        chat["/massages/" + sinItemData.itemKey + "/" + curTime + "/picURL"]  = currentUser.photoURL;      
        chat["/massages/" + sinItemData.itemKey + "/" + curTime + "/name"]  = currentUser.displayName;
        firebase.database().ref().update(chat);
        messBox.inputBox.find("#dialog").val(" ");
      }
    });

  });

  
      /*
        判斷使用者是否有登入，如果有登入就讓 #message 容器顯示輸入框。
        在 MessageBox 上面註冊事件，當 submit 時將資料上傳。
      */
      // if (currentUser) {
        // $("#message").append(messBox.inputBox);

        // messBox.inputBox.keypress(function (e) {
        //   if (e.which == 13) {
        //     e.preventDefault();

        //     /*
        //     取得input的內容 $(this).find("#dialog").val();
        //     清空input的內容 $(this).find("#dialog").val("");
        //     */
        //   }
        // });
      // }

    /*
    從資料庫中抓出message資料，並將資料填入MessageBox
    */
      // firebase.database().ref().orderBy.("",function(data) {

      // });


    /*
    如果使用者有登入，替 editBtn 監聽事件，當使用者點選編輯按鈕時，將資料顯示上 uploadModal。
    */
    // if (currentUser && currentUser.uid == sinItemData.seller) {
    //     product.editBtn.click(function(){
    //     uploadmodal.editData(sinItemData);
    //     uploadmodal.callImage(sinItemData.itemKey, sinItemData.seller)
    //   });
    // }
    if (currentUser == null) {
      product.editBtn = null;
    }else if(currentUser && currentUser.uid == sinItemData.seller) {
      product.editBtn.click(function(){
      uploadmodal.editData(sinItemData);
      uploadmodal.callImage(sinItemData.itemKey, sinItemData.seller)
      });
    }
  
}



function generateDialog(diaData, messageBox) {


}
