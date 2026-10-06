import { Link } from "@tanstack/react-router";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Button({className,variant="primary",...props}:ButtonHTMLAttributes<HTMLButtonElement>&{variant?:"primary"|"secondary"|"ghost"|"dark"}){
 return <button className={cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50", variant==="primary"&&"bg-primary text-primary-foreground shadow-action hover:-translate-y-0.5 hover:bg-primary/90",variant==="secondary"&&"border border-border bg-card text-foreground hover:bg-muted",variant==="ghost"&&"text-foreground hover:bg-muted",variant==="dark"&&"bg-foreground text-background hover:bg-foreground/90",className)} {...props}/>;
}
export function ActionLink({to,children,variant="primary",className}:{to:string;children:ReactNode;variant?:"primary"|"secondary"|"dark";className?:string}){
 return <Link to={to} className={cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",variant==="primary"&&"bg-primary text-primary-foreground shadow-action hover:-translate-y-0.5",variant==="secondary"&&"border border-border bg-card text-foreground hover:bg-muted",variant==="dark"&&"bg-foreground text-background",className)}>{children}</Link>;
}
export function Badge({children,tone="neutral"}:{children:ReactNode;tone?:"neutral"|"green"|"blue"|"gold"}){
 return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",tone==="neutral"&&"bg-muted text-muted-foreground",tone==="green"&&"bg-success-soft text-success",tone==="blue"&&"bg-info-soft text-info",tone==="gold"&&"bg-reward-soft text-reward")}>{children}</span>;
}
export function SectionHeading({eyebrow,title,body,action}:{eyebrow:string;title:string;body?:string;action?:ReactNode}){
 return <div className="mb-7 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4"><div className="min-w-0"><p className="eyebrow">{eyebrow}</p><h2 className="font-display text-3xl font-extrabold leading-tight md:text-5xl">{title}</h2>{body&&<p className="mt-2 max-w-2xl text-muted-foreground">{body}</p>}</div>{action}</div>;
}
