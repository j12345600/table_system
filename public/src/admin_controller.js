var total_seatA = 1;
var price = 1; //price
var dialog;
var but_map_info_flag=false;
var but_map_info_array=[];
var unavil_flag=false;
var unavil_array=[];
var socket=undefined;
var mapA={};
var map_tmp={};
var scA =null;
function hash(pass){
  return CryptoJS.SHA256(pass).toString();
}
$(document).ready(function() {
  var $seats = [$('#selected-seats_A'),$('#selected-seats_B'),$('#selected-seats_C')]; //Sitting Area
  var $hover=[$('#hover-seat_A'),$('#hover-seat_B'),$('#hover-seat_C')];
  var $online=$('#numOnline');
  $.get('/api/map').done(function(result){
    mapA=result;
    //set up map
    scA=$('#seat-mapA').seatCharts({
      map: mapA.map,
      naming: {
        top: false,
        // left:false,
        getLabel: function(character, row, column) {
          return (character.toUpperCase()+mapA.tid[row-1][column-1]+"/"+mapA.for[row-1][column-1]);
        }
      },
      legend: { //Definition legend
        node: $('#legend'),
        items: [
          ['a', 'available', 'Option'],
          ['a', 'unavailable', 'Sold']
        ]
      },
      focus  : function() {
      if (this.status() == 'available') {
          return 'focused';
      }else if (this.status() == 'selected') { //sold
        return this.style();
      } else  {
          //otherwise nothing changes
          $hover[0].text("");
          return this.style();
      }
      },
      click: function() { //Click event
        if(!but_map_info_flag) display_map_info(this.char(),this.settings.row,this.settings.column);
        if(unavil_flag){
          if(this.status() == 'available'|| this.status() == 'selected'){
            insert_avail_array(this.settings.id,this.status());
            scA.get(this.settings.id).status('unavailable');
            return 'unavailable';
          }
          else if(this.status() == 'unavailable'){
            stat=get_avail_array(this.settings.id);
            if(stat){
              scA.get(this.settings.id).status(stat);
              return stat
            }
            else{
              scA.get(this.settings.id).status("available");
              return "available";
            }
          }
        }
        else if(but_map_info_flag){
          write_in_to_map();
          display_map_info(this.char(),this.settings.row,this.settings.column);
          but_map_info_array[0]=this.settings.row;
          but_map_info_array[1]=this.settings.column;
          but_map_info_array[2]=this.settings.id;
          return this.style();
        }
        else if (this.status() == 'available') { //optional seat
          // $('<li>R' + (this.settings.row + 1) + ' S' + this.settings.label + '</li>')
          //   .attr('id', 'cart-item-' + this.settings.id)
          //   .data('seatId', this.settings.id)
          //   .appendTo($cart);
          //
          // $counter.text(sc.find('selected').length + 1);
           $seats[0].text(recalculateTotal(scA)-1);
           scA.get(this.settings.id).status('selected');
           if(socket){
             socket.emit('recv_updateA', {status:{
               unavailable:[],
               available:scA.find('available').seatIds,
               selected:scA.find('selected').seatIds
             }});
           }
          return 'selected';
        } else if (this.status() == 'selected') { //Checked
          // //Update Number
          // $counter.text(sc.find('selected').length - 1);
          // //update totalnum
          scA.get(this.settings.id).status('available');
          if(socket){
            socket.emit('recv_updateA', {status:{
              unavailable:[],
              available:scA.find('available').seatIds,
              selected:scA.find('selected').seatIds
            }});
          }

          $seats[0].text(recalculateTotal(scA)+1);
          //
          // //Delete reservation
          // $('#cart-item-' + this.settings.id).remove();
          //optional
          return 'available';
        } else if (this.status() == 'unavailable') { //sold
          return 'unavailable';
        } else {
          return this.style();
        }
      }
    });
  });
  $("#login-form").css("visibility","visible");
  dialog=$("#login-form").dialog({
    autoOpen: false,
    height: 550,
    width: 683,
    modal: true,
    buttons: {
      "Login": function() {
        $.post('/api/login', {
          account: $('#account').val(),
          passwd: hash($('#passwd').val()),
        }).done(function (result) {
          if(result.success!='false'){
            connect_socket(result.token);
            $(".but_login").text("登出");
            $(".but_map_info").removeClass("disabled");
            $(".but_unavil").removeClass("disabled");
            dialog.dialog("close");
          }
          else $("#validateTips").text("Wrong input");
        });
      }
    }
  });
  form = dialog.find( "form" ).on( "submit", function( event ) {
    event.preventDefault();
    $.post('/api/login', {
      account: $('#account').val(),
      passwd: hash($('#passwd').val()),
    }).done(function (result) {
      if(result.success!='false'){
        connect_socket(result.token);
        $(".but_login").text("登出");
        $(".but_map_info").removeClass("disabled");
        $(".but_unavil").removeClass("disabled");
        dialog.dialog("close");
      }

      else $("#validateTips").text("Wrong input");
    });
  });
  $.post('/api/login',{account:""}).done(function (result) {
    if(result.success=='false'){
       $(".but_login").css("visibility","visible");
       dialog.dialog("open");
    }
    else {
      $(".but_login").text("登出");
      $(".but_map_info").removeClass("disabled");
      $(".but_unavil").removeClass("disabled");
      connect_socket(result.token);
    }
  });
  function connect_socket(token){
    socket = io('', {
      query: 'token=' + token
    });
    socket.emit('new_connt', { time: new Date()});
    socket.on('updateA', function(status){
        // $('#updateInfo').text(msg.status);
        updateStatus(scA,status);
      });
    socket.on('updateB', function(status){
        // $('#updateInfo').text(msg.status);
        updateStatus(scB,status);
      });
    socket.on('updateC', function(status){
        // $('#updateInfo').text(msg.status);
        updateStatus(scC,status);
      });
    socket.on('updateOnline',function(number){
      $online.text(number);
      });
    socket.on('updateMap',function(){
        location.reload();
    });
  }
  $('table').addClass('table');
  $(".but_login").click(function(){
    if($(".but_login").text()==='登出'){
      $.get("/api/logout");
      socket.disconnect()
      dialog.dialog("open")
      $(".but_login").text("登入");
    }
    else dialog.dialog("open");
  });
  //sold seat
  //sc.get(['1_2', '4_4', '4_5', '6_6', '6_7', '8_5', '8_6', '8_7', '8_8', '10_1', '10_2']).status('unavailable');
});
function insert_avail_array(id,stat){
  unavil_array.push({id:id,stat:stat});
}
function get_avail_array(id){
  stat=null;
  unavil_array.forEach(function(element,index){
    if(element.id==id){
      element.id=null;
      stat=element.stat;
    }
  });
  return stat;
}
function updateStatus(sc,status){
  if(status!=undefined){
    sc.get(status.status.unavailable).status('unavailable');
    sc.get(status.status.available).status('available');
    sc.get(status.status.selected).status('selected');
  }
}
//sum total money
function recalculateTotal(sc) {
  var total = 0;
  sc.find('available').each(function() {
    total += price;
  });
  return total;
}
function but_unvail_onclick(){
  if(!$(".but_unavil").hasClass("disabled")){
    if($(".but_unavil").text()==="修改"){
      $(".but_map_info").addClass("disabled");
      unavil_flag=true;
      unavil_array=[];
      $(".but_unavil").removeClass("btn-warning");
      $(".but_unavil").addClass("btn-danger");
      $(".but_unavil").text("儲存");
    }
    else{       //Save changed
      unavil_flag=false;
      $(".but_unavil").removeClass("btn-danger");
      $(".but_unavil").addClass("btn-warning");
      $(".but_unavil").text("修改");
      $(".but_map_info").removeClass("disabled");
      if(socket){
        socket.emit('unavailable', {status:{
          unavailable:scA.find('unavailable').seatIds,
          available:scA.find('available').seatIds,
          selected:scA.find('selected').seatIds
        }});
      }
    }
  }
}
function but_map_info_onclick(){
  if(!$(".but_map_info").hasClass("disabled")){
    if($(".but_map_info").text()==="修改"){
      $(".input-char").val("");
      $(".input-num").val("");
      $(".input-count").val("");

      $(".but_unavil").addClass("disabled");
      but_map_info_flag=true;
      but_map_info_array=[];
    //   unavil_array=[];
      $(".but_map_info").removeClass("btn-warning");
      $(".but_map_info").addClass("btn-danger");
      $(".but_map_info").text("儲存");
      $(".input-char").attr('disabled', false);
      $(".input-num").attr('disabled', false);
      $(".input-count").attr('disabled', false);
    }
    else{       //Save changed
      but_map_info_flag=false;
      write_in_to_map();
      $(".but_map_info").removeClass("btn-danger");
      $(".but_map_info").addClass("btn-warning");
      $(".but_map_info").text("修改");
      $(".input-char").attr('disabled', true);
      $(".input-num").attr('disabled', true);
      $(".input-count").attr('disabled', true);
      if(socket){
        socket.emit('mapUpdate',mapA);
      }
      $(".but_unavil").removeClass("disabled");
      }
  }

}
function display_map_info(char,row,col){
  $(".input-char").val(char.toUpperCase());
  $(".input-num").val(mapA.tid[row][col]);
  $(".input-count").val(mapA.for[row][col]);
}
function write_in_to_map(){
  if(but_map_info_array.length==3){
    var row=but_map_info_array[0];
    var col=but_map_info_array[1];
    var id=but_map_info_array[2];
    var char=$(".input-char").val().toLowerCase();
    var itd=$(".input-num").val();
    var For=$(".input-count").val();
    if($.isNumeric(For)&&$.isNumeric(itd)&&char.length==1&&char[0]<='z'&&char[0]>='a'){
      itd=parseInt(itd);
      For=parseInt(For);
      if(itd>=0&&For>=0&&itd<=500&&For<=10){
        console.log(char,itd,For);
        mapA.map[row]=setCharAt(mapA.map[row],col,char);
        mapA.tid[row][col]=itd;
        mapA.for[row][col]=For;
        $('#'+id).text(char[0].toUpperCase()+itd+"/"+For);
        return true;
      }
    }
  }
  return false;
}
function setCharAt(str,index,chr) {
    if(index > str.length-1) return str;
    return str.substr(0,index) + chr + str.substr(index+1);
}
