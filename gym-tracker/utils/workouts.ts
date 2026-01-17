export const dbExerciseSearch = async (search: string) => {
    const res = await fetch(`http://localhost:3000/api/exercise?searchString=${encodeURIComponent(search)}`);
    return await res.json();
}