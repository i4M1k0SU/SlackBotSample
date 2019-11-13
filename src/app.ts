import { RTMClient } from '@slack/rtm-api';
import { WebClient } from '@slack/web-api';
import dotenv from 'dotenv';

dotenv.config();

const {
	SLACK_TOKEN,
	USER_GROUP_ID
} = process.env as { [key: string]: string };


const rtmClient = new RTMClient(SLACK_TOKEN);
const webClient = new WebClient(SLACK_TOKEN);

rtmClient.start();

rtmClient.on('message', async(message: any) => {
	// 自分の投稿は無視
	if (rtmClient.activeUserId === message.user) {
		return;
	}

	// test と含まれている投稿に対して Test と返す
	if (message.text.match(/test/)) {
		rtmClient.sendMessage(`<@${message.user}> Test`, message.channel);
	}

	// usergroup と含まれている投稿に対して .env で指定されている usergroup のメンバーにメンションを飛ばす
	if (message.text.match(/usergroup/)) {
		// usergroupのメンバー一覧を取得
		const users = await webClient.usergroups.users.list({usergroup: USER_GROUP_ID})
			.then(users => {
				if (!users.ok) {
					throw new Error();
				}

				return users.users as string[];
			})
			.catch(_ => {
				return null;
			});
		// users があるときだけsendMessageを実行
		users && rtmClient.sendMessage(users.map(user => `<@${user}>`).join(' '), message.channel);
	}
	
});
