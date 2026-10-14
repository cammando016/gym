import { Href, Link } from "expo-router";

interface Props {
    path: Href,
}

export default function AddNewButton ( props: Props ) {
    return (
        <Link href={props.path}>+</Link>
    )
}