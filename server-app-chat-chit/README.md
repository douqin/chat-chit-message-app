# README

## Api

### Auth `/auth`

- `[POST] /login`: login.
  - body: {username: String, password: String}.
  - result: {user : {userId","lastname","firstname","phone": "0842943637","birthday","gender","bio","username","avatar","background","email"} , token : {token: String, refreshToken: String}}.
- `[POST] /refresh-token`: refresh token.
  - body: {accessToken: String}.
  - result: {token: String}.
- `[POST] /registry`: đăng ký.
  - body: {name: String, username: String, password: String}.
- `[POST] /confirm-account`: xác nhận account.
  - body: {username: String, otp: String}.
- `[POST] /reset-otp`: reset otp.
  - body: {username: String}.
  - result: {status: boolean}.
- `[POST] /confirm-password`: xác nhận mật khẩu mới.
  - body: {username: String, otp: String, password: String}.
- `[GET] /users/:username`: get thông tin tóm tắt của user.
  - result: {name: String, username:String, avatar:String, isActived: boolean }
- `[DELETE] /revoke-token`: đăng xuất tất cả, socket cho user đang đăng nhập tài khoản.
  - body: {password: String, key: String}.
  - result: {token: String, refreshToken: String}.
  - socket: io.emit('revoke-token', {key: String}).
- `[PATCH] /password`: đổi mật khẩu.
  - body: {oldPassword: String, newPassword: String}.

### Me `/me`

- `[GET] /profile`: get thông tin.
  - result: {\_id: String, name: String, username: String, birthday: Date(JS) -> String,
    gender: number, avatar: String, background: String}.
- `[PATCH] /profile`: update thông tin.
  - body: {name: String, birthday: Date(JS) -> String, gender: int (0: nam, 1 nữ)}.
- `[PATCH] /avatar`: update avatar.
  - body: {file: File}.
  - result: {avatar: String}.
- `[PATCH] /background`: update ảnh bìa.
  - body: {file: File}.
  - result: {coverImage: String}
- `[GET] /phone-books`: get danh bạ.
  - result: [{_id, name, username, birthday: Date(JS) -> String, gender, avatar, avatarColor: String, background, status(gồm 4 trạng thái: FRIEND, FOLLOWER, YOU_FOLLOW, NO RELATIONSHIP), numberCommonGroup: int, numberCommonFriend: int, isExists: true}].
  - nếu không có {name, username, isExists: false}.
- `[POST] /phone-books`: đồng bộ danh bạ.
  - body: {phones: [{name: String, phone: String}]}.

### User `/user`

- `[GET] /search?phone=`: tìm kiếm bằng phone.
  - result: {\_id, name, username, birthday: Date(JS) -> String, gender, avatar, coverImage}.
- `[GET] /user/:username`: tim kiem user voi full thong tin
  - result: {\_id, name, username, birthday: Date(JS) -> String, gender, avatar, coverImage, status(gồm 4 trạng thái), numberCommonFriend: int}.

### Relationship `/relationship`

- `[GET] /friends`: get danh sách bạn bè.
  - param: {name: String}.
  - result: [{_id: String, name: String, username: String, avatar: String, isOnline: boolean, lastLogin: Date }].
- `[POST] /accept`: chấp nhận kết bạn, socket cho user đc kết bạn.
  - body: { idInvite : }
  - socket: io.emit('accept-friend', {\_id, name, avatar }).
  - socket (TH lạ, thì cả 2 sẽ nhận được): io.emit('create-individual-group-when-was-friend', groupId).
  - socket(TH đã có nhắn tin, thì cả 2 sẽ nhận được): io.emit('new-message', groupId, message).
- `[DELETE] /:userId/unfriend`: xóa kết bạn (socket bắn tới thằng bị xóa).
  - socket: io.emit('deleted-friend', \_id);
- `[GET] /invites`: get danh sách lời mời kết bạn của bản thân.
  - result: [{_id: String, name: String, username: String, avatar: String, numberCommonGroup: int, numberCommonFriend: int }].
- `[DELETE] /invites/:invite`: Xóa lời mời kết bạn (socket bắn tới thằng bị xóa).
  - params: invite tương ứng với id invite
  - socket: io.emit('deleted-friend-invite', \_id);
- `[GET] /invites/me`: get danh sách lời mời kết bạn của mình đã gởi.
  - result: [{_id: String, name: String, username: String, avatar: String, numberCommonGroup: int, numberCommonFriend: int }].
- `[POST] /invites/me/:userId`: gởi lời mời kết bạn cho người khác, socket cho user đc gởi lời mời kết bạn.
  - socket: io.emit('send-friend-invite', { \_id, name, avatar });
- `[DELETE] /invites/me/:invite`: xóa gởi lời mời kết bạn cho người khác (socket bắn tới thằng bị xóa).
  - socket: io.emit('deleted-invite-was-send', \_id);
  <!-- - `[GET] /suggest`: danh sách đề xuất bạn bè.
  - result: [{_id: String, name, username, avatar, numberCommonGroup: int, numberCommonFriend: int }]. -->
- `[POST] /:userId/block` : block user
- `[DELETE] /invites/me/:invite/` : xóa lời mời kết bạn mà chính bản thân đã gửi
- `[GET] /friends/online`: lấy tất cả friend online
- `[GET] /:userId/relation`: lấy ra mối quan hệ giữa user vs user

### Group `/group`

- `[GET]`: get danh sách trò chuyện mới nhất.

  - query : cursor , limit
    - P/s: cursor = -1 để lấy list gr mới nhất.
  - result:

    - ````{
        "data": [
            {
                "groupId": number,
                "name": string,
                "avatar": string,
                "status": GroupStatus,
                "createAt": string,
                "type": GroupType,
                "link": string,
                "role": string,
                "lastMessage": {
                    "manipulates": [] (userId[] ),
                    "tags": [] (memberId[] ),
                    "content": string,
                    "createAt": string,
                    "groupId": number,
                    "messageId": number,
                    "userId": number,
                    "replyMessageId": messageId or null,
                    "status": MessageStatus,
                    "type": number,
                    "memberId": number,
                    "reacts": [] (memberId[])
                },
                "totalMember": number,
                "numMessageUnread": number
            }
        ],
        "nextCursor": 194,
        "totalSize": 0
      }```
      ````

- `[GET] /:id`: get một group.
- `[POST] /individual-group/:userId`: tạo cuộc trò chuyện cá nhân (socket tới userId, nhận được socket này thì bắn socket join-group).
  - result: { groupId : number, isExisted : boolean }
    - p/s: trong trường hợp đã có rồi thì sẽ lấy ra group đã tồn tại
  - socket: io.emit('create-individual-group', groupId).
- `[POST] /groups/community-group`: tạo cuộc trò chuyện nhóm.
  - body: {name:String, userIds: [String]}.
  - socket: io.emit('create-group', groupId).
  - result: {\_id: String}.
- `[PATCH] /:id/renickname`: đổi biệt danh cá nhân
  - body: {name: String}.
  - socket: io.emit('change_nickname', message (mesage type noti) )
- `[PATCH] /:id/avatar`: thay ảnh nhóm.
  - req: {avatar: File}. - form data
  - socket: io.emit('update-avatar-group', groupId, groupAvatar, message).
  - socket: io.emit('new-message', message (Message Noti) ).
- `[GET] /:id/members`: danh sách thành viên.

  - res:

  - ````[
        {
            "memberId": number,
            "lastview": null or number (messageId),
            "position": PositionInGrop,
            "status": MemberStatus,
            "timejoin": string,
            "inforMember": User
        }
    ]```
    ````

- `[POST] /:id/members`: thêm nhiều thành viên.
  - p/s: gr private thì chỉ có admin mới add được còn group public thì sẽ cho vô hàng chờ duyệt hoặc duyệt ( phụ thuộc vào group có auto approval hay không) thì ai đều add được //TODO:
  - body: {userIds: [String]}.
  - socket (đối với thành viên trong nhóm) : io.emit('new-message', message).
  - socket (đối với user đc add): io.emit('added-group', groupId).
  - socket: io.emit('update-member', groupId).
- `[DELETE] /:id/members/:userId`: xóa thành viên.
  - socket (đối với thành viên trong nhóm) : io.emit('new-message', groupId, message).
  - socket (đối với user bị xóa): io.emit('deleted-group', groupId).
  - socket: io.emit('update-member', groupId).
- `[DELETE] /:id/members/leave`: Rời nhóm.
  - socket: io.emit('new-message', groupId, message )
  - socket: io.emit('update-member', groupId).
- `[DELETE] /:id`: xóa nhóm. //TODO:
- `[POST] /:id/members/join-from-link`: tham gia từ link.
  - socket (đối với thành viên trong nhóm) : io.emit('new-message', groupId, message) (nội dung: 'Tham gia từ link').
  - socket (đối với user đc add): io.emit('added-group', groupId).
  - socket: io.emit('update-member', groupId).
- `[GET] /:id/summary`: thông tin khi vào nhóm.
  - result: {\_id, name, avatar, users: [{name, avatar}] }.
- `[GET] /:id/last-view`: danh sách last view của danh sách members.
  - result: [{ user: {_id, name, avatar}, lastView: Date }].
- `[POST] /:id/managers`: thêm người quản lý nhóm.
  - body: {managerIds: [String]}.
  - socket: io.emit('add-managers', {groupId, managerIds})
  - socket: io.emit('new-message', groupId, message) (content: ADD_MANAGERS).
- `[DELETE] /:id/managers`: xóa người quản lý nhóm.
  - body: {managerIds: [String]}.
  - socket: io.emit('delete-managers', {groupId, managerIds})
  - socket: io.emit('new-message', groupId, message) (content: DELETE_MANAGERS).
- `[GET] /:id/community-group` get one community group

  - res :

  - ````{
                "groupId": number,
                "name": string,
                "avatar": string,
                "status": GroupStatus,
                "createAt": string,
                "type": GroupType,
                "link": string,
                "role": string,
                "lastMessage": {
                    "manipulates": [] (userId[] ),
                    "tags": [] (memberId[] ),
                    "content": string,
                    "createAt": string,
                    "groupId": number,
                    "messageId": number,
                    "userId": number,
                    "replyMessageId": messageId or null,
                    "status": MessageStatus,
                    "type": number,
                    "memberId": number,
                    "reacts": [] (memberId[])
                },
                "totalMember": number,
                "numMessageUnread": number
            }  ```
    ````

- `[GET] /:link` lấy data cơ bản của group

  - res:

  - ```{
              "groupId": number,
              "name": string,
              "avatar": string,
              "status": GroupStatus,
              "createAt": string,
              "type": GroupType,
              "link": string,
              "role": string,
    }
    ```

- `[POST] /:link/request-join`: nếu join thành công thì emit tới group hoặc là vào hàng đợi pending chờ duyệt hoặc là đã tham gia hoặc bị block ở group sẽ trả lỗi
  - io.emit("request-join-from-link", message (notify) )
- `[GET] /:id/queue-wait`: lấy danh sách đang chờ duyệt

  - res:

  - ```[
        {
            "memberId": number,
            "lastview": null or number (messageId),
            "position": PositionInGrop,
            "status": MemberStatus,
            "timejoin": string,
            "inforMember": User
        }
    ]
    ```

- `[POST] /admin/:id/approval/:userId`: duyệt thành viên
  - io.emit('approval-member' , {userIds : number})
  - io.emit('new-message', [Message])
- `[DELETE]` : remove manager
  - io.emit("remove-manager", { userId: number })
  - io.emit("new-message", [Message])
- `[DELETE] /admin/:id/member/:userId` : remove member
  - io.emit("member_was_remove", { userId: number })
  - io.emit("new-message", [Message])
- `[PATCH] /admin/:id/rename`
  - io.emit("rename-group", { name: string })
  - io.emit("new-message", [Message])

### Message `/message`

- `[GET] /:groupId`: danh sách tin nhắn theo cuộc trò chuyện.
  - params: cursor: number, size: number .
    - p/s: cursor = -1 khi lấy danh sách lần đầu tiên.
- `[GET] /:groupId/files`: danh sách tin nhắn dạng file.
  - req : params : cursor , size
  - res :[Message]
- `[POST] /:groupId/text`: send tin nhắn dạng text.
  - body: {content: String, manipulates: [number] (không bắt buộc), replyMessageId: number (không bắt buộc)}.
  - socket: io.emit('new-message', message).
- `[POST] /:groupId/files`: send tin nhắn dạng file.
  - req: 2 options
    - body: {files: [File]}.
    - form-data: files: [File]
  - socket: io.emit('new-message', groupId, message).
  - các file hợp lệ gửi cùng lúc nhiều file và tối đa 7 file ( mỗi file tối đa 20MB): chỉ các file là ảnh và video mới được phép gửi không sẽ bị chặn.
- `[PATCH] /:groupId/:id/recall`: thu hồi tin nhắn.
  - socket: io.emit('delete-message', {
    "userId": number,
    "messageId": number,
    "delby": number
    }).
- `[POST] /:groupId/:messageId/react/:type`: thả reaction.
  - res: -`{
    "reactionId": number,
    "userId": number,
    "messageId": number,
    "type": ReactMessage
}`
  - socket: io.emit('react-message', {"reactionId":number,
    "userId": number,
    "messageId": number,
    "type": ReactMessage});
- `[POST] /:groupId/:messageId/forward/:groupIdAddressee/: chuyển tiếp tin nhắn có groupId sang groupIdAddressee
  - socket: io.emit('new-message', message ).
- `[POST] /:groupId/gif` : send tin nhắn dạng gif
  - body: {content: String, replyMessageId: number (không bắt buộc)}.
  - socket: io.emit('new-message', message).
- `[GET] /pin/:groupId`: list tin nhắn gim.
- `[PATCH] /:groupId/:messageId/pin/:ispin`: pin or unpin tin nhắn.
  - params : ispin = 0 (unpin) or 1 (pin)
  - p/s: (tối đa là 3 tin nhắn đc gim).
  - có 2 content (PIN_MESSAGE, NOT_PIN_MESSAGE).
  - socket: io.emit('unpin-message', {"messageId": number}).
  - socket: io.emit('pin-message', "messageId": number).

### Vote `/votes` Coming Soon

- `[GET] /:groupId`: danh sách votes theo groupId.
  - params: { page, size }.
- `[POST]`: tạo bình chọn.
  - body: {content: String, options: [String], groupId: String}.
  - result: {\_id, user: {\_id, name, avatar},content, type: 'VOTE', options: [{name, userIds: [String]}], userOptions: [{_id, name, avatar}], createdAt}.
  - socket: io.emit('new-message', groupId, voteMessage).
- `[POST] /:messageId`: thêm bình chọn.
  - body: {options: [String]}.
  - socket: io.emit('update-vote-message', groupId, voteMessage).
- `[DELETE] /:messageId`: xóa bình chọn.
  - body: {options: [String]}.
  - socket: io.emit('update-vote-message', groupId, voteMessage).
- `[POST] /:messageId/choices`: chọn lựa chọn.
  - body: {options: [String]}.
  - socket: io.emit('update-vote-message', groupId, voteMessage).
- `[DELETE] /:messageId/choices`: xóa lựa chọn.
  - body: {options: [String]}.
  - socket: io.emit('update-vote-message', groupId, voteMessage).

### Story `/story`

- `[POST] /upload` upload story.
  - req : form-data - { file : File (image or video), visibility : number(Visibility) } .
  - res : { storyId: storyId} .

- `[GET]: /explore` Lấy danh sách story của bạn bè trong 24h gần nhất.
  - query : cursor&limit.
  - p/s: cursor = -1 lấy mặc định từ đầu - req : [Story] .

- `[GET] : /":userId/:storyId"`.
  - req: params userId và storyId muốn lấy.
  - res: Story.

- `[DELETE] : /me/:storyId` delete story.
  - req: params storyId muốn xóa.
  
- `[GET] : /me` lấy danh sách story của mình.
  - query : cursor&limit.
  - p/s: cursor = -1 lấy mặc định từ đầu.
  - res: [Story] .

- `[GET] : /:userId` lấy danh sách story của user.
  - query : cursor&limit.
    - p/s: cursor = -1 lấy mặc định từ đầu.
  - res: [Story] . //TODO:
  
### Socket Server nhận

- socket.on('typing', (groupId, me) => {
  socket.broadcast.to(groupId).emit('typing', groupId, me);
  });

- socket.on('not-typing', (groupId, me) => {
  socket.broadcast.to(groupId).emit('not-typing', groupId, me);
  });

- socket.on('get-user-online', (userId, ({isOnline, lastLogin}) => {} ))
-
- socket.on('group-last-view', (groupId) => {}): để cập nhật lại last view của mình ở group hoặc channel đó (nếu là channel thì phải truyền cả 2 tham số).

### Một số quy chuẩn dữ liệu

```RelationshipUser {
    NO_RELATIONSHIP = -1,
    /** user 1 wait reponse invite friend from user 2 */
    WAIT_RESPONSE_REQUEST_FRIEND = 0,
    //
    FRIEND = 1,
    /** user 1 block user 2 */
    BLOCKED = 3,
    /* user 1 block user 2 and user 2 block user 1*/
    TWO_WAY_BLOCK = 5,
    WAS_BLOCKED = 4,
}
```

```ReactMessage {
    HAHA = 1,
    HUHU = 2,
    LOVE = 3,
    WOW = 4,
    ANGRY = 5,
    LIKE = 6
}
```

```MessageStatus {
    DEFAULT = 0,
    DEL_BY_ADMIN = 1,
    DEL_BY_OWNER = 2
}
```

```enum MessageType {
    TEXT = 0,
    IMAGE = 1,
    VIDEO = 2,
    GIF = 3,
    VOTE = 4,
    NOTIFY = 5
}
```

```Gender {
    Male = 1,
    Female = 2,
    Other = 3,
}
```

```PositionInGrop {
    MEMBER = 0,
    ADMIN = 1,
    CREATOR = 2
}
```

```GroupStatus {
    DEFAULT = 0,
    STRANGE_PEOPLE = 1
}
```

```MemberStatus {
    DEFAULT = 0,
    PENDING = 1,
    BLOCKED = 2
}
```

```GroupType {
    COMMUNITY = 0,
    INVIDIAL = 1,
}

```

```ReactStory {
    HAHA = 1,
    HUHU = 2,
    LOVE = 3,
    WOW = 4,
    ANGRY = 5,
    LIKE = 6
}
```

```EVENT_GROUP_SOCKET{
    CHANGE_AVATAR = "avatar_change",
    LEAVE_GROUP = "user_leave_group",
    CREATE_INDIVIDUAL_GROUP = "create-individual-group",
    CHANGE_NICKNAME = "change_nickname",
}
```

```Visibility {
    PUBLIC = 0,
    FRIEND = 1,
    PRIVATE = 2
}
```
