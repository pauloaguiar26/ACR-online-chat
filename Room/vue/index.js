var socket = null;
var app = new Vue({
    el:'#app',
    data:{
        message: '',
        messages: [],
        email: '',
        password: '',
        username: '',
        users: [],
        state: 0,
        socketID: '',
    },
    methods:{
        sendMessage: function () {
            message = this.message.replace(/^\n|\n$/g, '');
            this.message = '';
            if(message){
                console.log(message);
                socket.emit('sending message', message);
                this.message = '';
            }		
        },
        login: function () {
            socket.emit('login', {email: this.email, password: this.password, username: this.username});
            this.email = '';
            this.username = '';
            this.password = '';
        },
        registUser: function () {
            this.email = '';
            this.username = '';
            this.password = '';	
            this.state = 2;
        },
        register: function () {
            socket.emit('regist', {email: this.email, password: this.password});
            this.email = '';
            this.username = '';
            this.password = '';
            this.state = 0;
        },
        SendPM: function() {
            message = this.message.replace(/^\n|\n$/g, '');
            this.message = '';
            if(message){
                socket.emit('PM', {socketID: this.socketID, msg: message });
                this.message = '';
                
            }
        },
    },
    created: function () {
        socket = io();
    },
    mounted: function () {

        socket.on('message', function (message) {
            app.messages.push(message);
            app.$nextTick(function (){
                var messageBox = document.getElementById('chatBox');
                messageBox.scrollTop = messageBox.scrollHeight;
            });
        });
        socket.on('whisper', function (message) {
            message.user = "private message from "+message.user;
            app.messages.push(message);
            app.$nextTick(function (){
                var messageBox = document.getElementById('chatBox');
                messageBox.scrollTop = messageBox.scrollHeight;
            });
        });
        socket.on('whisper sender', function (message) {
            message.user = "private message to "+message.user;
            app.messages.push(message);
            app.$nextTick(function (){
                var messageBox = document.getElementById('chatBox');
                messageBox.scrollTop = messageBox.scrollHeight;
            });
        });
        socket.on('joining', function(data){
            app.users = [];
            app.state = 1;
            for(i=0; i < data.length; i++)
            {
                app.users.push(data[i]);
            }
        });
        socket.on('updatelist', function(data){

            app.users = [];

            for(i=0; i < data.length; i++)
            {
                app.users.push(data[i]);
            }
        });
        socket.on('loadMessages',function(data){
            data.forEach(element => {
                app.messages.push({
                    user: element.user, message: element.msg
                });
            });
            
            app.$nextTick(function (){
                var messageBox = document.getElementById('chatBox');
                messageBox.scrollTop = messageBox.scrollHeight;
            });
        });
        socket.on('getID', function (sID) {
            this.socketID = sID;
        });
        

        
    },
});