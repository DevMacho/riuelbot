const Discord = require('discord.js');
const { MessageEmbed, Permissions } = require('discord.js');
const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS], partials: ['MESSAGE', 'CHANNEL', 'REACTION'] })

client.on('ready', () => {
    console.log('로그인 완료!');
    client.user.setActivity('ㄹ러시안룰렛');
});

let room = false;
function getRandom(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.round(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
  }

client.on('messageCreate', msg => {
    const splittedMsg = msg.content.split(' ');
    const userId = msg.author.id;

    if (msg.content.startsWith('ㄹ러시안룰렛') && msg.content != 'ㄹ러시안룰렛시작' && msg.content != 'ㄹ러시안룰렛종료') {
        if (!msg.member.permissions.has([Permissions.FLAGS.ADMINISTRATOR])) {
            msg.reply('권한이 부족해요!');
            return;
        }
        if (splittedMsg.length != 3) {
            msg.reply('`ㄹ러시안룰렛 [참가인원:자연수] [당첨자:자연수]`로 입력해주세요!')
            return;
        }
        if (isNaN(splittedMsg[1]) || isNaN(splittedMsg[2])) {
            msg.reply('`ㄹ러시안룰렛 [참가인원:자연수] [당첨자:자연수]`로 입력해주세요!')
            return;
        }
        if (!(Number(splittedMsg[1]) > 0) || !(Number(splittedMsg[2]) > 0)) {
            msg.reply('1 이상의 자연수를 입력해주세요!');
            return;
        }
        if (Number(splittedMsg[1]) < Number(splittedMsg[2])) {
            msg.reply('참가자 수보다 당첨자 수가 많을 수 없습니다!');
            return;
        }
        if(room != false){
            msg.reply('이미 게임이 진행되고 있습니다!');
            return;
        }
        const embeds = new MessageEmbed()
	    .setColor('#0099ff')
	    .setTitle('💀- 러시안룰렛 경기를 시작합니다 -💀')
        .setDescription(`🔫 총탄에는 총 ${splittedMsg[1]}발의 총알이 장전 가능하며 장전된 총알은 ${splittedMsg[2]}발입니다.\n👧 👦 🧔\n👱‍♀️ 🔫 🧑‍🦱\n🧑‍🦰 👵 👴\n\n참가하시는 참여자들은 ㄹ발사 를 입력해 주세요.🕵️`)
        msg.reply({ embeds: [embeds] });

        room = { id: userId, type : 'motherRussia', playerNum: Number(splittedMsg[1]), selectionPlayerNum: Number(splittedMsg[2]), participants: [] };
        console.log(room)
    }
    
    if (msg.content == 'ㄹ발사') {
        if (room == {} || room.type != 'motherRussia') {
            msg.reply('게임이 생성되지 않았거나 생성된 게임이 러시안 룰렛이 아닙니다.')
            return;
        }
        if (room.participants.includes(userId)) {
            msg.reply('이미 해당 게임에 참가했어요!');
            return;
        }
        if (room.playerNum < room.participants.length + 1) {
            msg.reply('해당 게임의 자리가 꽉 찼어요!!');
            return;
        }
        room.participants.push(userId);
        console.log(room)
        msg.reply('-러시안룰렛에 참여하였습니다.-');
    }

    if (msg.content == 'ㄹ러시안룰렛시작') {
        if (userId != room.id) {
            msg.reply('게임의 생성자만 러시안 룰렛을 시작할 수 있습니다!');
            return;
        }
        if (room.participants.length < room.playerNum) {
            msg.reply('설정한 플레이어 수보다 참가자가 적어 게임을 시작할 수 없습니다.');
            return;
        }
        let selectedPlayer = [];
        let selectingPlayer = room.participants;
        while (selectedPlayer.length != room.selectionPlayerNum) {
            const selectedNum = getRandom(0, room.selectionPlayerNum + 1);
            selectedPlayer.push(selectingPlayer[selectedNum]); 
            selectingPlayer = selectingPlayer.filter(p => p != selectingPlayer[selectedNum]);
            console.log(selectingPlayer)
        }
        let result = '';
        room.participants.forEach(p => {
            const selectedMsg = getRandom(0, 2);
            if (selectedPlayer.includes(p)) {
                if (selectedMsg == 0) {
                    result += `탕! 총알이 <@${p}>님의 뇌와 교감 중입니다.💀\n`
                }
                if (selectedMsg == 1) {
                    result += `탕! 행운의 여신이 <@${p}>님을 무시합니다💀\n`
                }
                if (selectedMsg == 2) {
                    result += `탕! 총알이 <@${p}>님을 지나치지 못했습니다.💀\n`
                }
            } else {
                if (selectedMsg == 0) {
                    result += `탕! <@${p}>님의 불발탄이 요란하게 발사됩니다. 생존을 축하드립니다.\n`
                }
                if (selectedMsg == 1) {
                    result += `탕! 죽음의 신이 <@${p}>님을 보며 입맛을 다십니다. 생존을 축하드립니다.\n`
                }
                if (selectedMsg == 2) {
                    result += `탕! 총알이 <@${p}>님과 노는 것을 거부합니다. 생존을 축하드립니다.\n`
                }
            }
        });
        const embeds = new MessageEmbed()
	    .setColor('#0099ff')
	    .setTitle(`${room.playerNum}중에서 ${room.selectionPlayerNum}의 인원만큼 탈락자 뽑기`)
        .setDescription(result)
        msg.reply({ embeds: [embeds] });
        room = false;
    }
    if (msg.content == 'ㄹ러시안룰렛종료') {
        if(room == false){
            msg.reply('현재 진행되고 있는 게임이 없습니다.');
            return;
        }
        if (room.id != userId) {
            msg.reply('게임의 생성자만 게임을 종료시킬 수 있습니다.')
            return;
        }
        room = false;
        const embeds = new MessageEmbed()
	    .setColor('#0099ff')
	    .setTitle(`-러시안룰렛을 종료합니다.-`)
        msg.reply({ embeds: [embeds] });
    }
    /////////////////////////////////////////////////////////////
    if (msg.content.startsWith('ㄹ악어게임') && msg.content != 'ㄹ악어게임시작'&& msg.content != 'ㄹ악어게임종료') {
        if (!msg.member.permissions.has([Permissions.FLAGS.ADMINISTRATOR])) {
            msg.reply('권한이 부족해요!');
            return;
        }
        if (splittedMsg.length != 3) {
            msg.reply('`ㄹ악어게임 [참가인원:자연수] [당첨자:자연수]`로 입력해주세요!')
            return;
        }
        if (isNaN(splittedMsg[1]) || isNaN(splittedMsg[2])) {
            msg.reply('`ㄹ악어게임 [참가인원:자연수] [당첨자:자연수]`로 입력해주세요!')
            return;
        }
        if (!(Number(splittedMsg[1]) > 0) || !(Number(splittedMsg[2]) > 0)) {
            msg.reply('1 이상의 자연수를 입력해주세요!');
            return;
        }
        if (Number(splittedMsg[1]) < Number(splittedMsg[2])) {
            console.log(splittedMsg)
            msg.reply('참가자 수보다 당첨자 수가 많을 수 없습니다!');
            return;
        }
        if (room != false) {
            msg.reply('이미 게임이 진행되고 있습니다!');
            return;
        }
        const embeds = new MessageEmbed()
	    .setColor('#0099ff')
	    .setTitle('💀- 죽음의 악어게임 -💀 ')
        .setDescription(`🐊 공격적인 악어가 입을 벌리고 깊은 낮잠을 즐기고 있습니다. 자고 있는 악어의 이빨을 뽑아오는 단순한 룰의 게임입니다.\n🦷악어의 이빨은 총 ${splittedMsg[1]}개 존재합니다. 단 ${splittedMsg[2]}개의 이빨만이 악어의 단잠을 깨울 수 있습니다. 당신의 용기와 운을 시험하세요.\nㄹ이빨 을 입력하여 게임에 참가하세요🕵️`)
        msg.reply({ embeds: [embeds] });

        room = { id: userId, type: 'gucci', playerNum: Number(splittedMsg[1]), selectionPlayerNum: Number(splittedMsg[2]), participants: [] };
        console.log(room)
    }
    
    if (msg.content == 'ㄹ이빨') {
        if (room == {} || room.type != 'gucci') {
            msg.reply('게임이 생성되지 않았거나 생성된 게임이 악어게임이 아닙니다.')
            return;
        }
        if (room.participants.includes(userId)) {
            msg.reply('이미 해당 게임에 참가했어요!');
            return;
        }
        if (room.playerNum < room.participants.length + 1) {
            msg.reply('해당 게임의 자리가 꽉 찼어요!!');
            return;
        }
        room.participants.push(userId);
        console.log(room)
        msg.reply('- 죽음의 악어 게임에 참여하였습니다.-');
    }

    if (msg.content == 'ㄹ악어게임시작') {
        if (userId != room.id) {
            msg.reply('게임의 생성자만 악어게임을 시작할 수 있습니다!');
            return;
        }
        if (room.participants.length < room.playerNum) {
            msg.reply('설정한 플레이어 수보다 참가자가 적어 게임을 시작할 수 없습니다.');
            return;
        }
        let selectedPlayer = [];
        let selectingPlayer = room.participants;
        while (selectedPlayer.length != room.selectionPlayerNum) {
            const selectedNum = getRandom(0, room.selectionPlayerNum + 1);
            selectedPlayer.push(selectingPlayer[selectedNum]); 
            selectingPlayer = selectingPlayer.filter(p => p != selectingPlayer[selectedNum]);
            console.log(selectingPlayer)
        }
        let result = '';
        room.participants.forEach(p => {
            const selectedMsg = getRandom(0, 2);
            if (selectedPlayer.includes(p)) {
                if (selectedMsg == 0) {
                    result += `악어의 이빨을 뽑는 순간 <@${p}>님의 시야가 붉게 변합니다. X를 눌러 조의를 표하십시오.💀 \n`
                }
                if (selectedMsg == 1) {
                    result += `<@${p}>님은 잠자는 악어의 이빨을 뽑았습니다!! 몸과 영혼이 분리되기 시작합니다.💀 \n`
                }
                if (selectedMsg == 2) {
                    result += `<@${p}>님은 성공적으로 악어의 이빨을 뽑.... 눈을 뜨니 악어의 뱃속입니다.💀\n`
                }
            } else {
                if (selectedMsg == 0) {
                    result += `<@${p}>님의 성공적으로 악어의 사랑니를 치료했습니다, 지붕 위로 던져주세요. 생존을 축하드립니다.\n`
                }
                if (selectedMsg == 1) {
                    result += `악어가 <@${p}>님의 따뜻한 손길에 만족하고 다시 잠을 청합니다. 생존을 축하드립니다.\n`
                }
                if (selectedMsg == 2) {
                    result += `<@${p}>님은 잠자는 악어의 이빨(1)을 획득했습니다. 생존을 축하드립니다.\n`
                }
            }
        });
        const embeds = new MessageEmbed()
	    .setColor('#0099ff')
	    .setTitle(`${room.playerNum}중에서 ${room.selectionPlayerNum}의 인원만큼 탈락자 뽑기`)
        .setDescription(result)
        msg.reply({ embeds: [embeds] });
        room = false;
    }
    if (msg.content == 'ㄹ악어게임종료') {
        if(room == false){
            msg.reply('현재 진행되고 있는 게임이 없습니다.');
            return;
        }
        if (room.id != userId) {
            msg.reply('게임의 생성자만 게임을 종료시킬 수 있습니다.')
            return;
        }
        room = false;
        const embeds = new MessageEmbed()
	    .setColor('#0099ff')
	    .setTitle(`-악어게임을 종료합니다.-`)
        msg.reply({ embeds: [embeds] });
    }
        /////////////////////////////////////////////////////////////
    if (msg.content.startsWith('ㄹ제비뽑기') && msg.content != 'ㄹ제비뽑기시작'&& msg.content != 'ㄹ제비뽑기종료') {
        if (!msg.member.permissions.has([Permissions.FLAGS.ADMINISTRATOR])) {
            msg.reply('권한이 부족해요!');
            return;
        }
        if (splittedMsg.length != 3) {
            msg.reply('`ㄹ제비뽑기 [참가인원:자연수] [당첨자:자연수]`로 입력해주세요!')
            return;
        }
        if (isNaN(splittedMsg[1]) || isNaN(splittedMsg[2])) {
            msg.reply('`ㄹ제비뽑기 [참가인원:자연수] [당첨자:자연수]`로 입력해주세요!')
            return;
        }
        if (!(Number(splittedMsg[1]) > 0) || !(Number(splittedMsg[2]) > 0)) {
            msg.reply('1 이상의 자연수를 입력해주세요!');
            return;
        }
        if (Number(splittedMsg[1]) < Number(splittedMsg[2])) {
            msg.reply('참가자 수보다 당첨자 수가 많을 수 없습니다!');
            return;
        }
        if (room != false ){
            msg.reply('이미 게임이 진행되고 있습니다!');
            return;
        }
        const embeds = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('💀- 죽음의 제비뽑기를 시작합니다 -💀')
            .setDescription(`🗳 상자에 준비된 티켓은 총 ${splittedMsg[1]}개가 준비되어 있습니다. 이 중 ${splittedMsg[2]}개의 빨간색 티켓이 존재합니다.\n빨간색 티켓에 당첨되신 분은 탈락 처리됩니다.💀\n\n🧑‍🦱 🧑‍🦰 👧 🧔 👱‍♀️ \nㅡㅡㅡㅡㅡㅡㅡㅡ\n🎫 🎫 🎟 🎫 🎫 \nㅡㅡㅡㅡㅡㅡㅡㅡ\n`)
            msg.reply({ embeds: [embeds] });
    
            room = { id: userId, type: 'dduck', playerNum: Number(splittedMsg[1]), selectionPlayerNum: Number(splittedMsg[2]), participants: [] };
            console.log(room)
        }
        
        if (msg.content == 'ㄹ뽑기') {
            if (room == {} || room.type != 'dduck') {
                msg.reply('게임이 생성되지 않았거나 생성된 게임이 제비뽑기가 아닙니다.')
                return;
            }
            if (room.participants.includes(userId)) {
                msg.reply('이미 해당 게임에 참가했어요!');
                return;
            }
            if (room.playerNum < room.participants.length + 1) {
                msg.reply('해당 게임의 자리가 꽉 찼어요!!');
                return;
            }
            room.participants.push(userId);
            console.log(room)
            msg.reply('- 죽음의 제비뽑기에 참여하였습니다. -');
        }
    
        if (msg.content == 'ㄹ제비뽑기시작') {
            if (userId != room.id) {
                msg.reply('게임의 생성자만 제비뽑기를 시작할 수 있습니다!');
                return;
            }
            if (room.participants < room.playerNum) {
                msg.reply('설정한 플레이어 수보다 참가자가 적어 게임을 시작할 수 없습니다.');
                return;
            }
            let selectedPlayer = [];
            let selectingPlayer = room.participants;
            while (selectedPlayer.length != room.selectionPlayerNum) {
                const selectedNum = getRandom(0, room.selectionPlayerNum + 1);
                selectedPlayer.push(selectingPlayer[selectedNum]); 
                selectingPlayer = selectingPlayer.filter(p => p != selectingPlayer[selectedNum]);
                console.log(selectingPlayer)
            }
            let result = '';
            room.participants.forEach(p => {
                const selectedMsg = getRandom(0, 1);
                if (selectedPlayer.includes(p)) {
                    if (selectedMsg == 0) {
                        result += `빨간색 티켓이 <@${p}>님을 반겨줍니다. 도망칠 곳은 없습니다.💀\n`
                    }
                    if (selectedMsg == 1) {
                        result += `<@${p}>님은 빨간색 티켓을 뽑았습니다. 당신의 도망치는 속도보다 요원의 총알이 빨랐습니다.💀\n`
                    }
                } else {
                    if (selectedMsg == 0) {
                        result += `승리의 여신이 <@${p}>님을 감싸며 하얀색 티켓을 뽑았습니다. 생존을 축하드립니다. \n`
                    }
                    if (selectedMsg == 1) {
                        result += `<@${p}> 님의 티켓 색은 순백의 하얀색입니다! 생존을 축하드립니다. \n`
                    }
                }
            });
            const embeds = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`${room.playerNum}중에서 ${room.selectionPlayerNum}의 인원만큼 탈락자 뽑기`)
            .setDescription(result)
            msg.reply({ embeds: [embeds] });
    }
    if (msg.content == 'ㄹ제비뽑기종료') {
        if(room == false){
            msg.reply('현재 진행되고 있는 게임이 없습니다.');
            return;
        }
        if (room.id != userId) {
            msg.reply('게임의 생성자만 게임을 종료시킬 수 있습니다.')
            return;
        }
        room = false;
        const embeds = new MessageEmbed()
	    .setColor('#0099ff')
	    .setTitle(`-제비뽑기를 종료합니다.-`)
        msg.reply({ embeds: [embeds] });
    }
})

client.login(token);