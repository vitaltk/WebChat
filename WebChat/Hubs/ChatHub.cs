using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNet.SignalR;
using WebChat.Models;
using WebChat.Helpers;

namespace WebChat.Hubs
{
    public class ChatHub : Hub
    {
        static List<User> Users = new List<User>();
        static int maxCountOfSavedMessages = AppSettings.GetSetting("maxCountOfSavedMessages", 10);
        static List<Message> Messages = new List<Message>(maxCountOfSavedMessages);

        /// <summary>
        /// New user connection
        /// </summary>
        /// <param name="nickName"></param>
        public void Connect(string nickName)
        {
            var id = Context.ConnectionId;

            if (!Users.Any(x => x.ConnectionId == id))
            {
                var cunnectedUser = new User { NickName = nickName, ConnectionId = id };
                Users.Add(cunnectedUser);
                Clients.Caller.onConnected(cunnectedUser);
                Clients.Others.onNewUserConnected(cunnectedUser);
            }
        }

        /// <summary>
        /// Get user
        /// </summary>
        /// <param name="connectionId"></param>
        /// <returns></returns>
        private User GetUser(string connectionId)
        {
            return Users.FirstOrDefault(x => x.ConnectionId == connectionId);
        }

        /// <summary>
        /// Sand message to all users
        /// </summary>
        /// <param name="message">Text of message</param>
        public void Send(string message)
        {
            var sender = GetUser(Context.ConnectionId);
            if (Messages.Count >= maxCountOfSavedMessages)
                Messages.RemoveAt(0);
            var newMessage = new Message { Sender = sender, Text = message };
            Messages.Add(newMessage);
            Clients.All.addMessage(newMessage);
        }

        /// <summary>
        /// When user disconnected
        /// </summary>
        /// <param name="stopCalled"></param>
        /// <returns></returns>
        public override System.Threading.Tasks.Task OnDisconnected(bool stopCalled)
        {
            var item = GetUser(Context.ConnectionId);
            if (item != null)
            {
                Users.Remove(item);
                Clients.All.onUserDisconnected(item);
            }
            return base.OnDisconnected(stopCalled);
        }

        public override System.Threading.Tasks.Task OnConnected()
        {
            Clients.Caller.initChat(Users, Messages);
            return base.OnConnected();
        }
    }
}