namespace WebChat.Models
{
    public class Message
    {
        public string Text { get; set; }
        public User Sender { get; set; }
    }
}