export interface IListCard{
id: string | number;
title: string;
// description: string;
imageUrl: string;
selectedValue: string | number | string[] | number[];
onChange: (value: string) => void;
inputType?: "radio" | "checkbox" | "delete" | "expand";
}