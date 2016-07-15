var total_seatA = 1;
var total_seatB = 1;
var total_seatC = 1;
var price = 1; //price
var dialog;
var mapA=[ //Seating chart
  'aa__aa_',
  'aaaaaaa',
  'aaaaaaa',
  'aaaaaaa',
  '_aaaaa_'
];
var mapApp=[
  [2,2,-1,-1,4,4,-1],
  [4,4,8,8,8,4,4],
  [4,4,8,8,8,4,4],
  [4,4,8,8,8,4,4],
  [-1,2,4,4,4,4,-1]
];
var mapB=[
  'aaaa',
  'aaaa',
  'aaaa',
  '_aaa',
  'aaaa',
  '_aa_'
];
var mapBpp=[
  [8,8,8,4],
  [8,8,8,4],
  [8,8,8,4],
  [-1,8,8,4],
  [8,8,8,4],
  [-1,8,8,-1]
];
var mapC=[
  'aa__',
  'aaa_',
  'aaaa',
  'aaa_',
  'aaaa'
];
var mapCpp=[
  [8,8,-1,-1],
  [8,8,8,-1],
  [8,8,8,8],
  [8,8,8,-1],
  [8,8,8,8]
];
$(document).ready(function() {
  var $seats = [$('#selected-seats_A'),$('#selected-seats_B'),$('#selected-seats_C')]; //Sitting Area
  var $hover=[$('#hover-seat_A'),$('#hover-seat_B'),$('#hover-seat_C')];
  var $online=$('#numOnline');
  var socket
  var scA = $('#seat-mapA').seatCharts({
    map: mapA,
    naming: {
      top: false,
      getLabel: function(character, row, column) {
        return "A"+total_seatA++;
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
        $hover[0].text(mapApp[this.settings.row ][this.settings.column]);

        return 'focused';
    }else if (this.status() == 'selected') { //sold
      $hover[0].text(mapCpp[this.settings.row ][this.settings.column]);
      return this.style();
    } else  {
        //otherwise nothing changes
        $hover[0].text("");
        return this.style();
    }
    },
    click: function() { //Click event
      if (this.status() == 'available') { //optional seat
        // $('<li>R' + (this.settings.row + 1) + ' S' + this.settings.label + '</li>')
        //   .attr('id', 'cart-item-' + this.settings.id)
        //   .data('seatId', this.settings.id)
        //   .appendTo($cart);
        //
        // $counter.text(sc.find('selected').length + 1);
         $seats[0].text(recalculateTotal(scA)-1);
         scA.get(this.settings.id).status('selected');
         socket.emit('recv_updateA', {status:{
           unavailable:scA.find('unavailable').seatIds,
           available:scA.find('available').seatIds,
           selected:scA.find('selected').seatIds
         }});
        return 'selected';
      } else if (this.status() == 'selected') { //Checked
        // //Update Number
        // $counter.text(sc.find('selected').length - 1);
        // //update totalnum
        scA.get(this.settings.id).status('available');
        socket.emit('recv_updateA', {status:{
          unavailable:scA.find('unavailable').seatIds,
          available:scA.find('available').seatIds,
          selected:scA.find('selected').seatIds
        }});
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
  var scB = $('#seat-mapB').seatCharts({
    map: mapB,
    naming: {
      top: false,
      getLabel: function(character, row, column) {
        return "B"+total_seatB++;
        //return "set"
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
        $hover[1].text(mapBpp[this.settings.row ][this.settings.column]);
        return 'focused';
    } else if (this.status() == 'selected') { //sold
      $hover[1].text(mapCpp[this.settings.row ][this.settings.column]);
      return this.style();
    }else  {
        //otherwise nothing changes
        $hover[1].text("");
        return this.style();
    }
    },
    click: function() { //Click event
      if (this.status() == 'available') { //optional seat
        // $('<li>R' + (this.settings.row + 1) + ' S' + this.settings.label + '</li>')
        //   .attr('id', 'cart-item-' + this.settings.id)
        //   .data('seatId', this.settings.id)
        //   .appendTo($cart);
        //
        // $counter.text(sc.find('selected').length + 1);
         $seats[1].text(recalculateTotal(scB)-1);

        return 'selected';
      } else if (this.status() == 'selected') { //Checked
        // //Update Number
        // $counter.text(sc.find('selected').length - 1);
        // //update totalnum
        $seats[1].text(recalculateTotal(scB)+1);
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
  var scC = $('#seat-mapC').seatCharts({
    map: mapC,
    naming: {
      top: false,
      getLabel: function(character, row, column) {
        return "C"+total_seatC++;
        //return "set"
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
        $hover[2].text(mapCpp[this.settings.row ][this.settings.column]);
        return 'focused';
    } else if (this.status() == 'selected') { //sold
      $hover[2].text(mapCpp[this.settings.row ][this.settings.column]);
      return this.style();
    }else  {
        //otherwise nothing changes
        $hover[2].text("");
        return this.style();
    }
    },
    click: function() { //Click event
      if (this.status() == 'available') { //optional seat
        // $('<li>R' + (this.settings.row + 1) + ' S' + this.settings.label + '</li>')
        //   .attr('id', 'cart-item-' + this.settings.id)
        //   .data('seatId', this.settings.id)
        //   .appendTo($cart);
        //
        // $counter.text(sc.find('selected').length + 1);
         $seats[2].text(recalculateTotal(scC)-1);

        return 'selected';
      } else if (this.status() == 'selected') { //Checked
        // //Update Number
        // $counter.text(sc.find('selected').length - 1);
        // //update totalnum
        $seats[2].text(recalculateTotal(scC)+1);
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
    height: 400,
    width: 350,
    modal: true,
    buttons: {
      "Login": function() {
        $.post('/api/login', {
          account: $('#account').val(),
          passwd: $('#passwd').val()
        }).done(function (result) {
          if(result.success!='false'){
            connect_socket(result.token);
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
      passwd: $('#passwd').val()
    }).done(function (result) {
      if(result.success!='false'){
        connect_socket(result.token);
        dialog.dialog("close");
      }

      else $("#validateTips").text("Wrong input");
    });
  });
  $.post('/api/login',{account:""}).done(function (result) {
    if(result.success=='false'){
       dialog.dialog("open");
    }
    else connect_socket(result.token);
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
