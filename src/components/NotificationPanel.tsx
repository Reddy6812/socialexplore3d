import React, { FC, useRef, useEffect, useState } from 'react';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useGraphData } from '../hooks/useGraphData';
import { usePostData } from '../hooks/usePostData';
import { useChatData } from '../hooks/useChatData';
import { useNavigate } from 'react-router-dom';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

interface NotificationPanelProps {
  user: any;
}

const NotificationPanel: FC<NotificationPanelProps> = ({ user }) => {
  const graph = useGraphData(user.id);
  const postData = usePostData();
  const chatData = useChatData(user.id);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => { setAnchorEl(event.currentTarget); };
  const handleClose = () => { setAnchorEl(null); };

  // Friend requests directed to me
  const friendReqCount = graph.friendRequests.filter(r => r.to === user.id).length;

  // Track initial post IDs to detect new posts by others
  const initialMaxPost = useRef(Math.max(0, ...postData.posts.map(p => Number(p.id))));
  const [newPostCount, setNewPostCount] = useState(0);
  useEffect(() => {
    const count = postData.posts.filter(p =>
      p.authorId !== user.id && Number(p.id) > initialMaxPost.current
    ).length;
    setNewPostCount(count);
  }, [postData.posts, user.id]);

  // Total messages from others (naive unread count)
  const newMsgCount = chatData.chats.reduce(
    (sum, chat) => sum + chat.messages.filter(m => m.senderId !== user.id).length,
    0
  );

  const total = friendReqCount + newPostCount + newMsgCount;

  return (
    <>
      <Badge badgeContent={total} color="error">
        <IconButton color="inherit" onClick={handleClick}>
          <NotificationsIcon />
        </IconButton>
      </Badge>
      <Menu anchorEl={anchorEl} open={openMenu} onClose={handleClose}>
        <MenuItem onClick={() => { navigate('/friends'); handleClose(); }}>
          Friend Requests ({friendReqCount})
        </MenuItem>
        <MenuItem onClick={() => { navigate('/home'); handleClose(); }}>
          New Posts ({newPostCount})
        </MenuItem>
        <MenuItem onClick={() => { navigate('/chats'); handleClose(); }}>
          Messages ({newMsgCount})
        </MenuItem>
      </Menu>
    </>
  );
};

export default NotificationPanel; 