export const getDayOfSplit = async (username: string) => {
    if (!username) throw new Error('Username not found');
    const res = await fetch(`http://localhost:3000/api/users/${encodeURIComponent(username)}/split-day`);
    return res.json();
}