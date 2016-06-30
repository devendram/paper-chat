(function() {
    'use strict';

    var uuid, avatar, color, cat;


    // Assign a uuid made of a random cat and a random color
    var randomColor = function() {
        var colors = ['navy', 'slate', 'olive', 'moss', 'chocolate', 'buttercup', 'maroon', 'cerise', 'plum', 'orchid'];
        return colors[(Math.random() * colors.length) >>> 0];
    };

    var randomCat = function() {
        var cats = ['tabby', 'bengal', 'persian', 'mainecoon', 'ragdoll', 'sphynx', 'siamese', 'korat', 'japanesebobtail', 'abyssinian', 'scottishfold'];
        return cats[(Math.random() * cats.length) >>> 0];
    };

    color = randomColor();
    cat = randomCat();
    uuid = color + '-' + cat;
    avatar = 'images/' + cat + '.jpg';

    function get_url_vars() {
        var vars = {};
        var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
            vars[key] = value;
        });
        return vars;
    }

    function get_lang() {
        console.log(get_url_vars()['lang']);
        return (get_url_vars()['lang']);
    }

    function get_channel() {
        console.log(get_url_vars()['channel']);
        return (get_url_vars()['channel'] || 'pubnub-chat');
    }

    function get_session() {
        console.log(get_url_vars()['session']);
        return (get_url_vars()['session']);
    }

    function showNewest() {
        //document.querySelector('core-scaffold').$.headerPanel.scroller.scrollTop = document.querySelector('.chat-list').scrollHeight;
        var chatDiv = document.querySelector('.chat-list');
        chatDiv.scrollTop = chatDiv.scrollHeight;
    }

    /* Polymer UI and UX */

    var template = document.querySelector('template[is=auto-binding]');

    template.channel = get_channel();
    template.session = get_session();
    template.uuid = uuid;
    template.avatar = avatar;
    template.color = color;
    
    template.lang = get_lang();
    console.log(template.channel);
    console.log(typeof template.lang);
    console.log(template.lang === 'undefined');
    template.sub_channel = 
    (template.lang === 'undefined')?template.channel:
                            (template.channel + '-' + template.lang);

    console.log('SUB Channel : ' + template.sub_channel);


    template.checkKey = function(e) {
        if(e.keyCode === 13 || e.charCode === 13) {
            template.publish();
        }
    };

    template.sendMyMessage = function(e) {
        template.publish();
    };

    template.messageList = [];


    /* PubNub Realtime Chat */

    var pastMsgs = [];
    var onlineUuids = [];

    template.getListWithOnlineStatus = function(list) {
        [].forEach.call(list, function(l) {
            // sanitize avatars
            var catName = (l.uuid + '').split('-')[1];
            l.avatar = 'images/' + catName + '.jpg';

            if (catName === undefined || /\s/.test(l.uuid)) {
                l.uuid = 'fail-cat';
                console.log('Oh you, I made this demo open so nice devs can play with, but you are soiling everything :-(');
            }

            if(onlineUuids.indexOf(l.uuid) > -1) {
                l.status = 'online';
            } else {
                l.status = 'offline';
            }
        });
        return list;
    };

    template.displayChatList = function(list) {
        template.messageList = list;
        // scroll to bottom when all list items are displayed
        template.async(showNewest);
    };

    template.subscribeCallback = function(e) {
        console.log('SUB CALLBACK');
        if(template.$.sub.messages.length > 0) {
            /*
            console.log(template.$.sub.messages);
            var len = template.$.sub.messages.length;

            var size = 100;
            var gif = 
            '<html><br><img class="gif" src="http://giphy.com/embed/Luv6pUwBTIeuk"' 
                + (size ? (' height="' + size + '"') : '') + ' ></html>'; 

            template.$.sub.messages[len - 1].text = gif;             

            */
            var len = template.$.sub.messages.length;
            var msg = template.$.sub.messages[len - 1];

            var a = pastMsgs.concat(this.getListWithOnlineStatus(template.$.sub.messages))
            this.displayChatList(a);
            console.log(JSON.stringify(msg));
            if (msg.speech && !msg.played && msg.uuid !== uuid) {
                msg.speech = msg.speech + '&watson-token=omhNtfnbBgV7qMsptjf%2F23Mj3vXCbbEGL3XkSZ%2Fiy%2Fgg0%2FAGdBLz8CDL7xlcdlv9LPBiF6bPSkHfmumadOphkZ4JU98p8ARI2EHoAicHCaV4xP7%2BP3lnnVU76ZI8gLFLbHmLmdq7hAegmizWjs0YRIkZq2Grz3B5wVIr3dR70w9q69sKIPJ72mQ0WQXeC7xh7twPWD%2BpN7YiznphsfWuiKvibb5o1k5Sjn3jxu%2FsaKrws1N1OTcYQh3dU90PomS%2BJB0BvnT7jIPZLnj41DSC6%2F%2BgS98JDKWQwub%2Fep0%2BItmSnbYPrVLnz7jdpd3wp6kkKB7VTVksCICJYyGaNYVJmoX2rxfLSI0CbT0LL%2Faut9sOQDMHc1piLQbp8LY7liR3ebgXpKPiY3Yh5f%2BsJLNpkcI1idcELC6KFkf92AAzS%2BFquB351OZ9V6IE7e1aAiekENks4KDsgdasp%2F0RAtiTkLmqvnqy61hUKzRjZ%2FPuMIQErKEpamga8r04GMtcRkBX5DiaVNbEGSEEqG26uL7u7Y38QFuFejw1HoA66N7uW0IeizepScGix08qaaCeg1hiHiTEtAkcQFP%2B2PHYlXNpfgMGrg24sHNsIJJobfKD7v%2Ff8m2dOWFI3WTPpnK7dEA1gzVXPXrgrrO0hw9SKKVZPJvT9Cu0Kf3JKipb3bbM19o%2F2bTLJQ8NPqmdczhJNqL18qQDYTdKmFQcZRG5%2BBONmIwoOTjFM%2BKI5Sdz%2FqheK4bclJLbap5BgQOMTBSpiLm61yKMnk9BtBo5KmDVAQxi5pQEfpZuSAHtl4xhta%2FmMOwxvA4cSSHSQWoYGeEgE1SrSKpret1tFMDd%2B7f29Tm2kw%3D%3D'
                var speech = new Audio(msg.speech);
                msg.played = true;
                speech.play();
            }
        }
    };

    template.presenceChanged = function(e) {
        var i = 0;
        var l = template.$.sub.presence.length;
        var d = template.$.sub.presence[l - 1];

        // how many users
        template.occupancy = d.occupancy;

        // who are online
        if(d.action === 'join') {
            if(d.uuid.length > 35) { // console
                d.uuid = 'the-mighty-big-cat';
            }
            onlineUuids.push(d.uuid);
        } else {
            var idx = onlineUuids.indexOf(d.uuid);
            if(idx > -1) {
                onlineUuids.splice(idx, 1);
            }
        }

        i++;

        // display at the left column
        template.cats = onlineUuids;
        // update the status at the main column
        if(template.messageList.length > 0) {
            template.messageList = this.getListWithOnlineStatus(template.messageList);
        }
    };

    template.historyRetrieved = function(e) {
        if(e.detail[0].length > 0) {
            pastMsgs = this.getListWithOnlineStatus(e.detail[0]);
            this.displayChatList(pastMsgs);
        }
    };

    template.publish = function() {
        if(!template.input) return;

        template.$.pub.message = {
            uuid: uuid,
            avatar: avatar,
            color: color,
            text: template.input,
            timestamp: new Date().toISOString(),
            input_lang : template.lang
        };
        if (template.session) {
            template.$.pub.message['session_id'] = template.session;
        }
        template.$.pub.publish();
        template.input = '';
    };

    template.error = function(e) {
        console.log(e);
    };

})();