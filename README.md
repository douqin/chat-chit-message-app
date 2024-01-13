## Api

### Auth `/auth`

- `[POST] /login`: login.
  - body: {username: String, password: String}.
  - result: {user : {iduser","lastname","firstname","phone": "0842943637","birthday","gender","bio","username","avatar","background","email"} , token : {token: String, refreshToken: String}}.
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

### Me `/me`

- `[GET] /profile`: get thông tin.
  - result: {\_id: String, name: String, username: String, birthday: Date(JS) -> String,
    gender: boolean, avatar: String, avatarColor: String, coverImage: String}.
- `[PUT] /profile`: update thông tin.
  - body: {name: String, birthday: Date(JS) -> String, gender: int (0: nam, 1 nữ)}.
- `[PATCH] /avatar`: update avatar.
  - body: {file: File}.
  - result: {avatar: String}.
- `[PATCH] /cover-image`: update ảnh bìa.
  - body: {file: File}.
  - result: {coverImage: String}
- `[PATCH] /avatar/base64`: update avatar base64.
  - body: {fileName, fileExtension, fileBase64}.
  - result: {avatar: String}.
- `[PATCH] /cover-image/base64`: update ảnh bìa base64.
  - body: {fileName, fileExtension, fileBase64}.
  - result: {coverImage: String}
- `[GET] /phone-books`: get danh bạ.
  - result: [{_id, name, username, birthday: Date(JS) -> String, gender, avatar, avatarColor: String, background, status(gồm 4 trạng thái: FRIEND, FOLLOWER, YOU_FOLLOW, NO RELATIONSHIP), numberCommonGroup: int, numberCommonFriend: int, isExists: true}].
  - nếu không có {name, username, isExists: false}.
- `[POST] /phone-books`: đồng bộ danh bạ.
  - body: {phones: [{name: String, phone: String}]}.
- `[PATCH] /password`: đổi mật khẩu.
  - body: {oldPassword: String, newPassword: String}.
- `[DELETE] /revoke-token`: đăng xuất tất cả, socket cho user đang đăng nhập tài khoản.
  - body: {password: String, key: String}.
  - result: {token: String, refreshToken: String}.
  - socket: io.emit('revoke-token', {key: String}).

### User `/users`

- `[GET] /search?phone=`: tìm kiếm bằng phone.
  - result: {\_id, name, username, birthday: Date(JS) -> String, gender, avatar, coverImage}.
- `[GET] /user/:username`: tim kiem user voi full thong tin
  - result: {\_id, name, username, birthday: Date(JS) -> String, gender, avatar, coverImage, status(gồm 4 trạng thái), numberCommonFriend: int}.

### Friend `/friends`

- `[GET] `: get danh sách bạn bè.
  - param: {name: String}.
  - result: [{_id: String, name: String, username: String, avatar: String, isOnline: boolean, lastLogin: Date }].
- `[POST] /:userId`: chấp nhận kết bạn, socket cho user đc kết bạn.
  - socket: io.emit('accept-friend', {\_id, name, avatar }).
  - socket (TH lạ, thì cả 2 sẽ nhận được): io.emit('create-individual-group-when-was-friend', groupId).
  - socket(TH đã có nhắn tin, thì cả 2 sẽ nhận được): io.emit('new-message', groupId, message).
- `[DELETE] /:userId`: xóa kết bạn (socket bắn tới thằng bị xóa).
  - socket: io.emit('deleted-friend', \_id);
- `[GET] /invites`: get danh sách lời mời kết bạn của bản thân.
  - result: [{_id: String, name: String, username: String, avatar: String, numberCommonGroup: int, numberCommonFriend: int }].
- `[DELETE] /invites/:userId`: Xóa lời mời kết bạn (socket bắn tới thằng bị xóa).
  - socket: io.emit('deleted-friend-invite', \_id);
- `[GET] /invites/me`: get danh sách lời mời kết bạn của mình đã gởi.
  - result: [{_id: String, name: String, username: String, avatar: String, numberCommonGroup: int, numberCommonFriend: int }].
- `[POST] /invites/me/:userId`: gởi lời mời kết bạn cho người khác, socket cho user đc gởi lời mời kết bạn.
  - socket: io.emit('send-friend-invite', { \_id, name, avatar });
- `[DELETE] /invites/me/:userId`: xóa gởi lời mời kết bạn cho người khác (socket bắn tới thằng bị xóa).
  - socket: io.emit('deleted-invite-was-send', \_id);
- `[GET] /suggest`: danh sách đề xuất bạn bè.
  - params: {page (default: 0), size (default: 12)}.
  - result: [{_id: String, name, username, avatar, numberCommonGroup: int, numberCommonFriend: int }].

### Group `/groups`

- `[GET] `: get danh sách trò chuyện mới nhất.

  - params: {name: String (default: '') , type: int (0: tất cả, không tìm tên ;1: cá nhân; 2: nhóm) (default: 0) }.
  - body : { cursor , limit}
    - P/s: cursor = -1 để lấy list gr mới nhất.
  - result: [{_id: String, name: String, avatar: String, userId: String, friendStatus: String , type: boolean, numberUnread: int, isNotify, isJoinFromLink,
    lastMessage: {
    _id: String,
    content: String,
    type: String (TEXT, IMAGE, VIDEO,FILE),
    createdAt: String,
    user: {
    _id: String,
    name: String,
    avatar: String
    }
    }
    }].

- `[GET] /:id`: get một group.
- `[POST] /individual-group/:userId`: tạo cuộc trò chuyện cá nhân (socket tới userId, nhận được socket này thì bắn socket join-group).
  - result: { Group.Object }.
    - nếu group tồn tại trả về status code 400
  - socket: io.emit('create-individual-group', groupId).
- `[POST] /groups/community-group`: tạo cuộc trò chuyện nhóm.
  - body: {name:String, userIds: [String]}.
  - socket: io.emit('create-group', groupId).
  - result: {\_id: String}.
- `[PATCH] /:id/name`: đổi biệt danh cá nhân hoặc đổi tên nhóm (nếu là nhóm thì có socket).
  - body: {name: String}.
  - socket: io.emit('rename-group', groupId, groupName, message).
- `[PATCH] /:id/avatar`: thay ảnh nhóm.
  - body: {file: File}.
  - socket: io.emit('update-avatar-group', groupId, groupAvatar, message).
  - socket: io.emit('new-message', groupId, message).
- `[PATCH] /:id/avatar/base64`: thay ảnh nhóm.
  - body: {fileName, fileExtension, fileBase64}.
  - socket: io.emit('update-avatar-group', groupId, groupAvatar, message).
  - socket: io.emit('new-message', groupId, message).
- `[DELETE] /:id/messages`: xóa tất cả tin nhắn.
- `[GET] /:id/members`: danh sách thành viên.
- `[POST] /:id/members`: thêm nhiều thành viên.
  - body: {userIds: [String]}.
  - socket (đối với thành viên trong nhóm) : io.emit('new-message', groupId, message).
  - socket (đối với user đc add): io.emit('added-group', groupId).
  - socket: io.emit('update-member', groupId).
- `[DELETE] /:id/members/:userId`: xóa thành viên.
  - socket (đối với thành viên trong nhóm) : io.emit('new-message', groupId, message).
  - socket (đối với user bị xóa): io.emit('deleted-group', groupId).
  - socket: io.emit('update-member', groupId).
- `[DELETE] /:id/members/leave`: Rời nhóm.
  - socket: io.emit('new-message', groupId, message )
  - socket: io.emit('update-member', groupId).
- `[DELETE] /:id`: xóa nhóm.
  - socket: io.emit('delete-group', groupId ).
- `[POST] /:id/members/join-from-link`: tham gia từ link.
  - socket (đối với thành viên trong nhóm) : io.emit('new-message', groupId, message) (nội dung: 'Tham gia từ link').
  - socket (đối với user đc add): io.emit('added-group', groupId).
  - socket: io.emit('update-member', groupId).
- `[PATCH] /:id/join-from-link/:isStatus`: trạng thái co cho tham gia vào link không (chỉ chủ nhóm) (isStatus: 0 or 1).
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

### Message `/messages`.

- `[GET] /:groupId`: danh sách tin nhắn theo cuộc trò chuyện.
  - params: {page: int(default: 0), size: int(default: 20) }.
- `[GET] /channel/:channelId`: danh sách tin nhắn theo kênh.
  - params: {page: int(default: 0), size: int(default: 20) }.
- `[GET] /:groupId/files`: danh sách tin nhắn dạng file.
  - params: {type: String (default tìm theo từng phân loại: ALL) (ALL, IMAGE, VIDEO, FILE), senderId: String (không bắt buộc), startTime: String(yyyy-mm-dd)(không bắt buộc), endTime: String(yyyy-mm-dd)(không bắt buộc)}.
- `[POST] /text`: send tin nhắn dạng text.
  - body: {content: String, tags: [String] (không bắt buộc), replyMessageId: String (không bắt buộc), type: String (TEXT, HTML, NOTIFY, STICKER) , groupId: String, channelId: String}.
  - socket: io.emit('new-message', groupId, message).
  - socket (nếu là channel): io.emit('new-message-of-channel', groupId, channelId, message).
- `[POST] /files`: send tin nhắn dạng file.
  - body: {file: File}.
  - params: {type: String ('IMAGE', 'VIDEO', 'FILE'), groupId: String, channelId: String }.
  - socket: io.emit('new-message', groupId, message).
  - socket (nếu là channel): io.emit('new-message-of-channel', groupId, channelId, message).
  - các file hợp lệ (tối đa 20MB): .png, .jpeg, .jpg, .gif, .mp3, .mp4, .pdf, .doc, .docx, .ppt, .pptx, .rar, .zip .
- `[POST] /files/base64`: send tin nhắn dạng file base64.
  - body: {fileName, fileExtension, fileBase64}.
  - params: {type: String ('IMAGE', 'VIDEO', 'FILE'), groupId: String, channelId: String }.
  - socket: io.emit('new-message', groupId, message).
  - socket (nếu là channel): io.emit('new-message-of-channel', groupId, channelId, message).
  - các file hợp lệ (fileExtension) (tối đa 20MB): .png, .jpeg, .jpg, .gif, .mp3, .mp4, .pdf, .doc, .docx, .ppt, .pptx, .rar, .zip .
- `[DELETE] /:id`: thu hồi tin nhắn.
  - socket: io.emit('delete-message', {groupId, channelId, id}).
- `[DELETE] /:id/only`: xóa tin nhắn ở phía tôi.
- `[POST] /:id/reacts/:type`: thả reaction.
  - socket: io.emit('add-reaction', {groupId, channelId, messageId, user, type});
- `[GET] /:id/share/:groupId`: chuyển tiếp tin nhắn có id sang cuộc trò chuyện có groupId.
  - socket: io.emit('new-message',groupId, message ).
- `[PATCH] /:id/notify/:isNotify`: update thông báo (0 là tắt, 1 là bật).
- `[GET] /:id/summary`: thông tin khi vào nhóm.
  - result: {\_id, name, avatar, users: [{name, avatar}] }.

### Pin Message `/pin-messages`.

- `[GET] /:groupId`: list tin nhắn gim.
- `[POST] /:messageId`: gim tin nhắn (tối đa là 3 tin nhắn đc gim).
- `[DELETE] /:messageId`: xóa gim.
  - có 2 content (PIN_MESSAGE, NOT_PIN_MESSAGE).
  - socket: io.emit('new-message', groupId, message).
  - socket: io.emit('action-pin-message', groupId).

### Vote `/votes`.

- `[GET] /:groupId`: danh sách votes theo groupId.
  - params: { page, size }.
- `[POST] `: tạo bình chọn.
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

## Admin

### User Manager `/admin/users-manager`.

- `[GET] `: get list users.

  - params: {username: String (default: ''), page: int (default: 0), size: int(default: 20)}.
  - result: [{_id, name, username, gender, isActived, isDeleted, isAdmin }].

- `[PATCH] /:id/:isDeleted`: cập nhật trạng thái hoạt động (isDeleted là 0(kích hoạt) và 1(không kích hoạt) ).

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

### Socket Server trả về

- **group**

  - socket.emit('user-last-view', {groupId, channelId, userId, lastView: Date } ): user đã xem tin nhắn ở group hoặc channel.
  - new member join group
  - event: ''
  - res data: {}
  - invite group:
  - member leave group:
  - rename group:
  - approval member:
  - joinfromLink (socket to admin):

- **message**

  - receive message:
  - file:
  - text:
  - react message:
  - update-last-view (user seen message):
  - recall message:
  - change pin:
  
- **friend**
   -  handling 99%...
  
- **notification**
   -  handling 99%...