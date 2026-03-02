import * as React from 'react';
import { type DialogProps } from '@radix-ui/react-dialog';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';

type CommandContextValue = {
  query: string;
  setQuery: (value: string) => void;
};

const CommandContext = React.createContext<CommandContextValue | null>(null);

function useCommandContext() {
  const context = React.useContext(CommandContext);
  if (!context) {
    throw new Error('Command components must be used inside <Command>.');
  }
  return context;
}

const Command = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  const [query, setQuery] = React.useState('');
  return (
    <CommandContext.Provider value={{ query, setQuery }}>
      <div
        ref={ref}
        className={cn('flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground', className)}
        {...props}
      />
    </CommandContext.Provider>
  );
});
Command.displayName = 'Command';

interface CommandDialogProps extends DialogProps {}

const CommandDialog = ({ children, ...props }: CommandDialogProps) => (
  <Dialog {...props}>
    <DialogContent className="overflow-hidden p-0 shadow-lg">
      <Command>{children}</Command>
    </DialogContent>
  </Dialog>
);

const CommandInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, onChange, ...props }, ref) => {
    const { setQuery } = useCommandContext();
    return (
      <div className="flex items-center border-b px-3">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <input
          ref={ref}
          className={cn(
            'flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          onChange={(event) => {
            setQuery(event.target.value);
            onChange?.(event);
          }}
          {...props}
        />
      </div>
    );
  }
);
CommandInput.displayName = 'CommandInput';

const CommandList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('max-h-[300px] overflow-y-auto overflow-x-hidden', className)} {...props} />
));
CommandList.displayName = 'CommandList';

const CommandEmpty = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('py-6 text-center text-sm text-muted-foreground', className)} {...props} />
));
CommandEmpty.displayName = 'CommandEmpty';

const CommandGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { heading?: string }>(
  ({ className, heading, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'overflow-hidden p-1 text-foreground [&_[data-command-heading]]:px-2 [&_[data-command-heading]]:py-1.5 [&_[data-command-heading]]:text-xs [&_[data-command-heading]]:font-medium [&_[data-command-heading]]:text-muted-foreground',
        className
      )}
      {...props}
    >
      {heading ? <div data-command-heading>{heading}</div> : null}
      {children}
    </div>
  )
);
CommandGroup.displayName = 'CommandGroup';

const CommandSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('-mx-1 h-px bg-border', className)} {...props} />
));
CommandSeparator.displayName = 'CommandSeparator';

type CommandItemProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  keywords?: string[];
  value?: string;
  onSelect?: (value: string) => void;
};

const CommandItem = React.forwardRef<HTMLButtonElement, CommandItemProps>(
  ({ className, keywords = [], value = '', children, onSelect, onClick, ...props }, ref) => {
    const { query } = useCommandContext();
    const normalizedQuery = query.trim().toLowerCase();
    const haystack = [value, ...(keywords || [])].join(' ').toLowerCase();
    if (normalizedQuery && !haystack.includes(normalizedQuery)) return null;

    return (
      <button
        type="button"
        ref={ref}
        className={cn(
          "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
          className
        )}
        onClick={(event) => {
          onSelect?.(value);
          onClick?.(event);
        }}
        {...props}
      >
        {children}
      </button>
    );
  }
);
CommandItem.displayName = 'CommandItem';

const CommandShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn('ml-auto text-xs tracking-widest text-muted-foreground', className)} {...props} />
);
CommandShortcut.displayName = 'CommandShortcut';

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator
};
