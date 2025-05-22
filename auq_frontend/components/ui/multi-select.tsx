"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Command, CommandGroup, CommandItem } from "@/components/ui/command"
import { Command as CommandPrimitive } from "cmdk"

type Option = {
    label: string
    value: string
    description?: string
    unit?: string
}

interface MultiSelectProps {
    options: Option[]
    selected: string[]
    onChange: (selected: string[]) => void
    placeholder?: string
    className?: string
}

export function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = "Select options...",
    className,
}: MultiSelectProps) {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState("")

    const handleUnselect = (option: string) => {
        onChange(selected.filter((s) => s !== option))
    }

    const handleKeyDown = React.useCallback(
        (e: React.KeyboardEvent<HTMLDivElement>) => {
            const input = inputRef.current
            if (input) {
                if (e.key === "Delete" || e.key === "Backspace") {
                    if (input.value === "" && selected.length > 0) {
                        onChange(selected.slice(0, -1))
                    }
                }
                if (e.key === "Escape") {
                    input.blur()
                }
            }
        },
        [selected, onChange]
    )

    const selectables = options.filter((option) => !selected.includes(option.value))

    return (
        <Command
            onKeyDown={handleKeyDown}
            className={`overflow-visible bg-transparent ${className}`}
        >
            <div className="group rounded-md bg-gray-100/80 px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <div className="flex flex-wrap gap-1">
                    {selected.map((selectedValue) => {
                        const option = options.find((o) => o.value === selectedValue)
                        if (!option) return null
                        return (
                            <Badge
                                key={option.value}
                                variant="secondary"
                                className="rounded-sm px-1 font-normal bg-white/80 hover:bg-white"
                            >
                                {option.label}
                                <button
                                    className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleUnselect(option.value)
                                        }
                                    }}
                                    onMouseDown={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                    }}
                                    onClick={() => handleUnselect(option.value)}
                                >
                                    <X className="h-3 w-3 text-gray-500 hover:text-gray-700" />
                                </button>
                            </Badge>
                        )
                    })}
                    <CommandPrimitive.Input
                        ref={inputRef}
                        value={inputValue}
                        onValueChange={setInputValue}
                        onBlur={() => setOpen(false)}
                        onFocus={() => setOpen(true)}
                        placeholder={selected.length === 0 ? placeholder : undefined}
                        className="ml-2 flex-1 bg-transparent outline-none placeholder:text-gray-400"
                    />
                </div>
            </div>
            <div className="relative mt-2">
                {open && selectables.length > 0 ? (
                    <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
                        <CommandGroup className="h-full overflow-auto">
                            {selectables.map((option) => {
                                return (
                                    <CommandItem
                                        key={option.value}
                                        onMouseDown={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                        }}
                                        onSelect={() => {
                                            setInputValue("")
                                            onChange([...selected, option.value])
                                        }}
                                        className={"cursor-pointer"}
                                    >
                                        <div>
                                            <div className="font-medium">{option.label}</div>
                                            {option.description && (
                                                <div className="text-sm text-muted-foreground">
                                                    {option.description}
                                                </div>
                                            )}
                                        </div>
                                    </CommandItem>
                                )
                            })}
                        </CommandGroup>
                    </div>
                ) : null}
            </div>
        </Command>
    )
} 