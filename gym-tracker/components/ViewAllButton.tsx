import { Href, Link } from "expo-router";

interface Props {
    path: Href,
}

export default function ViewAllButton ( props: Props ) {
    return (
        <Link href={props.path}>View All</Link>
    )
}