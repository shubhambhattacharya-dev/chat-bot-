import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import useFollow from "../../hooks/useFollow";

const UserList = ({ username, listType }) => {
	const { follow, isPending } = useFollow();

	const {
		data: users,
		isLoading,
		refetch,
		isRefetching,
	} = useQuery({
		queryKey: ["userList", listType, username],
		queryFn: async () => {
			try {
				const res = await fetch(`/api/users/${listType}/${username}`, { credentials: 'include' });
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
	});

	useEffect(() => {
		refetch();
	}, [listType, username, refetch]);

	return (
		<div className='flex flex-col'>
			{isLoading || isRefetching ? (
				<div className='flex justify-center items-center h-32'>
					<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
				</div>
			) : users?.length === 0 ? (
				<p className='text-center text-slate-500 mt-4'>No {listType} found.</p>
			) : (
				users?.map((user) => (
					<div key={user._id} className='flex items-center justify-between p-4 border-b border-gray-700'>
						<Link to={`/profile/${user.username}`} className='flex items-center gap-3 flex-1'>
							<div className='avatar'>
								<div className='w-12 rounded-full'>
									<img src={user.profileImg || "/avatar-placeholder.png"} alt={user.username} />
								</div>
							</div>
							<div className='flex flex-col'>
								<span className='font-semibold text-sm'>{user.fullName}</span>
								<span className='text-slate-500 text-sm'>@{user.username}</span>
								{user.bio && <span className='text-slate-400 text-xs mt-1'>{user.bio}</span>}
							</div>
						</Link>
						<button
							className='btn btn-outline btn-sm rounded-full'
							onClick={() => follow(user._id)}
							disabled={isPending}
						>
							{isPending ? "Loading..." : "Follow"}
						</button>
					</div>
				))
			)}
		</div>
	);
};

export default UserList;
