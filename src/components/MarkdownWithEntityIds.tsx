import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { EntityIdText } from './EntityIdTooltip';

interface MarkdownWithEntityIdsProps {
  children: string;
  isUser?: boolean;
  [key: string]: unknown;
}

/**
 * Helper to recursively extract and process text from React children
 */
function processChildrenForIds(
  children: React.ReactNode,
  isUser?: boolean
): React.ReactNode {
  if (typeof children === 'string') {
    return <EntityIdText text={children} isUser={isUser} />;
  }

  if (Array.isArray(children)) {
    return children.map((child, index) => {
      if (typeof child === 'string') {
        return <EntityIdText key={index} text={child} isUser={isUser} />;
      }
      // Recursively process nested elements
      if (React.isValidElement(child)) {
        const props = child.props as Record<string, unknown>;
        return React.cloneElement(
          child,
          { ...props, key: index },
          processChildrenForIds(props.children as React.ReactNode, isUser)
        );
      }
      return child;
    });
  }

  // Handle single React element
  if (React.isValidElement(children)) {
    const props = children.props as Record<string, unknown>;
    return React.cloneElement(
      children,
      props,
      processChildrenForIds(props.children as React.ReactNode, isUser)
    );
  }

  return children;
}

/**
 * Custom ReactMarkdown wrapper that processes IDs before rendering.
 * This ensures IDs are detected and wrapped with tooltips.
 */
export function MarkdownWithEntityIds({
  children,
  isUser,
  ...props
}: MarkdownWithEntityIdsProps) {
  return (
    <ReactMarkdown
      {...props}
      remarkPlugins={[remarkGfm]}
      components={{
        ...(props.components || {}),
        // Override paragraph to detect and wrap IDs
        p: ({ children: pChildren, ...pProps }) => {
          return <p {...pProps}>{processChildrenForIds(pChildren, isUser)}</p>;
        },
        // Override list items
        li: ({ children: liChildren, ...liProps }) => {
          return (
            <li {...liProps}>{processChildrenForIds(liChildren, isUser)}</li>
          );
        },
        // Override headings
        h1: ({ children: h1Children, ...h1Props }) => {
          return (
            <h1 {...h1Props}>{processChildrenForIds(h1Children, isUser)}</h1>
          );
        },
        h2: ({ children: h2Children, ...h2Props }) => {
          return (
            <h2 {...h2Props}>{processChildrenForIds(h2Children, isUser)}</h2>
          );
        },
        h3: ({ children: h3Children, ...h3Props }) => {
          return (
            <h3 {...h3Props}>{processChildrenForIds(h3Children, isUser)}</h3>
          );
        },
        h4: ({ children: h4Children, ...h4Props }) => {
          return (
            <h4 {...h4Props}>{processChildrenForIds(h4Children, isUser)}</h4>
          );
        },
        h5: ({ children: h5Children, ...h5Props }) => {
          return (
            <h5 {...h5Props}>{processChildrenForIds(h5Children, isUser)}</h5>
          );
        },
        h6: ({ children: h6Children, ...h6Props }) => {
          return (
            <h6 {...h6Props}>{processChildrenForIds(h6Children, isUser)}</h6>
          );
        },
        // Override blockquote
        blockquote: ({ children: bqChildren, ...bqProps }) => {
          return (
            <blockquote {...bqProps}>
              {processChildrenForIds(bqChildren, isUser)}
            </blockquote>
          );
        },
        // Override table cells
        td: ({ children: tdChildren, ...tdProps }) => {
          return (
            <td {...tdProps}>{processChildrenForIds(tdChildren, isUser)}</td>
          );
        },
        th: ({ children: thChildren, ...thProps }) => {
          return (
            <th {...thProps}>{processChildrenForIds(thChildren, isUser)}</th>
          );
        },
        // Handle inline code
        code: ((props: {
          inline?: boolean;
          children?: React.ReactNode;
          className?: string;
          [key: string]: unknown;
        }) => {
          const {
            inline,
            children: codeChildren,
            className,
            ...codeProps
          } = props;
          if (inline) {
            const codeString =
              typeof codeChildren === 'string'
                ? codeChildren
                : Array.isArray(codeChildren)
                  ? codeChildren
                      .map(c => (typeof c === 'string' ? c : String(c)))
                      .join('')
                  : String(codeChildren);
            return (
              <code {...codeProps} className={className}>
                <EntityIdText text={codeString} isUser={isUser} />
              </code>
            );
          }
          return (
            <code {...codeProps} className={className}>
              {codeChildren}
            </code>
          );
        }) as unknown as React.ComponentType<React.HTMLAttributes<HTMLElement>>,
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
