import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import LoadingSpinner from "../../components/common/LoadingSpinner";

import { IoSettingsOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { FaHeart, FaRegComment, FaRegBookmark } from "react-icons/fa6";
import { FaExclamationTriangle } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";

const NotificationPage = () => {
	const queryClient = useQueryClient();
	const { data, isLoading } = useQuery({
		queryKey: ["notifications"],
		queryFn: async () => {
			try {
				const res = await fetch("/api/notifications");
				const data = await res.json();
				if (!res.ok) throw new Error(data.error || "Something went wrong");
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
	});

	const { mutate: deleteNotifications } = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch("/api/notifications", {
					method: "DELETE",
				});
				const data = await res.json();

				if (!res.ok) throw new Error(data.error || "Something went wrong");
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
		onSuccess: () => {
			toast.success("Notifications deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	return (
		<>
			<div className='flex-[4_4_0] border-l border-r border-gray-700 min-h-screen'>
				<div className='flex justify-between items-center p-4 border-b border-gray-700'>
					<p className='font-bold'>Notifications</p>
					<div className='dropdown '>
						<div tabIndex={0} role='button' className='m-1'>
							<IoSettingsOutline className='w-4' />
						</div>
						<ul
							tabIndex={0}
							className='dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52'
						>
							<li>
								<a onClick={deleteNotifications}>Delete all notifications</a>
							</li>
						</ul>
					</div>
				</div>
				{isLoading && (
					<div className='flex justify-center h-full items-center'>
						<LoadingSpinner size='lg' />
					</div>
				)}
				{data?.notifications?.length === 0 && <div className='text-center p-4 font-bold'>No notifications 🤔</div>}
{data?.notifications?.map((notification) => (
	<div className='border-b border-gray-700' key={notification._id}>
		<div className='flex gap-2 p-4'>
			{notification.type === "follow" && <FaUser className='w-7 h-7 text-primary' />}
			{notification.type === "like" && <FaHeart className='w-7 h-7 text-red-500' />}
			{notification.type === "comment" && <FaRegComment className='w-7 h-7 text-blue-500' />}
			{notification.type === "repost" && <BiRepost className='w-7 h-7 text-green-500' />}
			{notification.type === "bookmark" && <FaRegBookmark className='w-7 h-7 text-yellow-500' />}
			{notification.type === "report" && <FaExclamationTriangle className='w-7 h-7 text-red-700' />}
			<Link to={`/profile/${notification.from.username}`}>
				<div className='avatar'>
					<div className='w-8 rounded-full'>
						<img src={notification.from.profileImg || "/avatar-placeholder.png"} />
					</div>
				</div>
				<div className='flex gap-1'>
					<span className='font-bold'>@{notification.from.username}</span>{" "}
					{notification.type === "follow" && "followed you"}
					{notification.type === "like" && "liked your post"}
					{notification.type === "comment" && "commented on your post"}
					{notification.type === "repost" && "reposted your post"}
					{notification.type === "bookmark" && "bookmarked your post"}
					{notification.type === "report" && "reported your post"}
				</div>
			</Link>
			{(notification.type !== "follow") && notification.post && (
				<div className='ml-4'>
					{notification.post.img ? (
						<img src={notification.post.img} alt="Post image" className="w-16 h-16 object-cover rounded" />
					) : (
						<span className="text-sm italic">{notification.post.text?.slice(0, 30)}...</span>
					)}
				</div>
			)}
		</div>
	</div>
))}
			</div>
		</>
	);
};
export default NotificationPage;