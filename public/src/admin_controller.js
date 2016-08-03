var total_seatA = 1;
var total_seatB = 1;
var total_seatC = 1;
var price = 1; //price
var dialog;
var mapA=[
'____bbbbbbb_f',
'____bbbbbbb_f',
'____bbbbbbb_f',
'____bbbbbbb__',
'_______ffff_f',
'_____________',
'_______ffff_f',
'aaaa_________',
'aaaa___d_dd_',
'aaaa_f______d',
'aaaa_f___dddd',
'aaaa_f_d_dddd',
'aaaa_f___dddd',
];
function hash(pass){
  return CryptoJS.SHA256(pass).toString();
}
$(document).ready(function() {
  var $seats = [$('#selected-seats_A'),$('#selected-seats_B'),$('#selected-seats_C')]; //Sitting Area
  var $hover=[$('#hover-seat_A'),$('#hover-seat_B'),$('#hover-seat_C')];
  var $online=$('#numOnline');
  var socket=undefined
  var scA = $('#seat-mapA').seatCharts({
    map: mapA,
    naming: {
      top: false,
      // left:false,
      getLabel: function(character, row, column) {
        return (character.toUpperCase()+total_seatA++);
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
      if (this.status() == 'available') { //optional seat
         $seats[0].text(recalculateTotal(scA)-1);
         scA.get(this.settings.id).status('selected');
         if(socket){
           socket.emit('recv_updateA', {status:{
             unavailable:scA.find('unavailable').seatIds,
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
            unavailable:scA.find('unavailable').seatIds,
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
