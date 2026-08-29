import Empty from "../../assets/Empty.svg"

export function EmptyPage({ removeAdd = false, item }: { removeAdd?: boolean, item: string }) {
    return <div className="flex flex-col items-center justify-center py-14">
        <img src={Empty} alt="Empty" className="size-70" />
        <p className="text-center px-12 text-msCardPrimaryText text-sm">There are no {item}s{!removeAdd && `, click on “add” to create a new ${item}.`}</p>
    </div>
}