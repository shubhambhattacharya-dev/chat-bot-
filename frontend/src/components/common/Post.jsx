import { FaRegComment, FaRegHeart, FaRegBookmark, FaTrash, FaHeart, FaBookmark } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";

const Post = ({ post, authUser }) => {
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();

  const postOwner = post.user;
  const isLiked = authUser && post.likes ? post.likes.some(id => id.toString() === authUser._id.toString()) : false;
  const isMyPost = authUser && authUser._id === post.user._id;
  const isReposted = authUser && post.reposts ? post.reposts.some(id => id.toString() === authUser._id.toString()) : false;
  const isBookmarked = authUser && post.bookmarks ? post.bookmarks.some(id => id.toString() === authUser._id.toString()) : false;

  const formatPostDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`;
    return date.toLocaleDateString();
  };

  const formattedDate = formatPostDate(post.createdAt);

  const { mutate: deletePost, isLoading: isDeleting } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/posts/${post._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete post");
      return data;
    },
    onSuccess: () => {
      toast.success("Post deleted successfully");
      queryClient.invalidateQueries(["posts"]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: likePost, isLoading: isLiking } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/posts/like/${post._id}`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to like post");
      return data;
    },
    onSuccess: () => {
      toast.success("Like status updated");
      queryClient.invalidateQueries(["posts"]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: repostPost, isLoading: isReposting } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/posts/repost/${post._id}`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to repost");
      return data;
    },
    onSuccess: () => {
      toast.success("Repost status updated");
      queryClient.invalidateQueries(["posts"]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: bookmarkPost, isLoading: isBookmarking } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/posts/bookmark/${post._id}`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to bookmark post");
      return data;
    },
    onSuccess: () => {
      toast.success("Bookmark status updated");
      queryClient.invalidateQueries(["posts"]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleBookmarkPost = () => {
    if (!isBookmarking) {
      bookmarkPost();
    }
  };

  const handleDeletePost = () => deletePost();
  const handleLikePost = () => {
    if (!isLiking) {
      likePost();
    }
  };
  const handleRepostPost = () => {
    if (!isReposting) {
      repostPost();
    }
  };

  const { mutate: commentPost, isLoading: isCommenting } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/posts/comment/${post._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: comment }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to comment");
      return data;
    },
    onSuccess: () => {
      toast.success("Comment posted successfully");
      setComment("");
      document.getElementById(`comments_modal${post._id}`).close();
      queryClient.invalidateQueries(["posts"]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!comment.trim() || isCommenting) return;
    commentPost();
  };

  return (
    <div className="flex gap-2 items-start p-4 border-b border-gray-700">
      <div className="avatar">
        <Link to={`/profile/${postOwner.username}`} className="w-8 rounded-full overflow-hidden">
          <img src={postOwner.profileImg || "/avatar-placeholder.png"} alt={postOwner.username} />
        </Link>
      </div>
      <div className="flex flex-col flex-1">
        <div className="flex gap-2 items-center">
          <Link to={`/profile/${postOwner.username}`} className="font-bold">{postOwner.fullName}</Link>
          <span className="text-gray-700 flex gap-1 text-sm">
            <Link to={`/profile/${postOwner.username}`}>@{postOwner.username}</Link>
            <span>·</span>
            <span>{formattedDate}</span>
          </span>
          {isMyPost && (
            <span className="flex justify-end flex-1">
              {isDeleting ? <LoadingSpinner size="sm" /> : (
                <FaTrash className="cursor-pointer hover:text-red-500 text-red-400" onClick={handleDeletePost} />
              )}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3 overflow-hidden">
          <span>{post.text}</span>
          {post.img && (
            <img
              src={post.img.startsWith("/uploads/") ? `http://localhost:5000${post.img}?t=${new Date(post.updatedAt).getTime()}` : post.img + "?t=" + new Date(post.updatedAt).getTime()}
              className="h-80 object-contain rounded-lg border border-gray-700"
              alt="Post"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/avatar-placeholder.png";
              }}
            />
          )}
        </div>

        <div className="flex justify-between mt-3">
          <div className="flex gap-4 items-center w-2/3 justify-between">

            <div className="flex gap-1 items-center cursor-pointer group" onClick={() => document.getElementById(`comments_modal${post._id}`).showModal()}>
              <FaRegComment className="w-4 h-4 text-slate-500 group-hover:text-sky-400" />
              <span className="text-sm text-slate-500 group-hover:text-sky-400">{post.comments.length}</span>
            </div>

            <dialog id={`comments_modal${post._id}`} className="modal border-none outline-none">
              <div className="modal-box rounded border border-gray-600 bg-base-100">
                <h3 className="font-bold text-lg mb-4">COMMENTS</h3>
                <div className="flex flex-col gap-3 max-h-60 overflow-auto">
                  {post.comments.length === 0 && <p className="text-sm text-slate-500">No comments yet 🤔 Be the first one 😉</p>}
                  {post.comments.map((c) => (
                    <div key={c._id} className="flex gap-2 items-start p-2 bg-base-200 rounded">
                      <div className="avatar"><div className="w-8 rounded-full"><img src={c.user.profileImg || "/avatar-placeholder.png"} alt={c.user.username} /></div></div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <span className="font-bold">{c.user.fullName}</span>
                          <span className="text-gray-700 text-sm">@{c.user.username}</span>
                        </div>
                        <div className="text-sm">{c.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <form className="flex gap-2 items-center mt-4 border-t border-gray-600 pt-2" onSubmit={handlePostComment}>
                  <textarea className="textarea w-full p-1 rounded text-md resize-none border focus:outline-none border-gray-800" placeholder="Add a comment..." value={comment} onChange={(e) => setComment(e.target.value)} rows={2} />
                  <button className="btn btn-primary rounded-full btn-sm text-white px-4" disabled={isCommenting || !comment.trim()}>
                    {isCommenting ? <LoadingSpinner size="md" /> : "Post"}
                  </button>
                </form>
              </div>
              <form method="dialog" className="modal-backdrop"><button className="outline-none">close</button></form>
            </dialog>

            <div className={`flex gap-1 items-center group cursor-pointer ${isReposted ? "text-green-500" : "text-slate-500"}`} onClick={handleRepostPost}>
              <BiRepost className="w-6 h-6" />
              <span className="text-sm">{post.reposts.length}</span>
            </div>

            <div className={`flex gap-1 items-center group cursor-pointer ${isLiked ? "text-pink-500" : "text-slate-500"}`} onClick={handleLikePost}>
              {isLiking ? <LoadingSpinner size="sm" /> : (isLiked ? <FaHeart className="w-4 h-4 text-pink-500" /> : <FaRegHeart className="w-4 h-4 group-hover:text-pink-500" />)}
              <span className="text-sm">{post.likes.length}</span>
            </div>
          </div>

          <div className="flex w-1/3 justify-end gap-2 items-center">
            <div className={`flex gap-1 items-center group cursor-pointer ${isBookmarked ? "text-yellow-500" : "text-slate-500"}`} onClick={handleBookmarkPost}>
              {isBookmarking ? <LoadingSpinner size="sm" /> : (isBookmarked ? <FaBookmark className="w-4 h-4 text-yellow-500" /> : <FaRegBookmark className="w-4 h-4 group-hover:text-yellow-500" />)}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Post;
