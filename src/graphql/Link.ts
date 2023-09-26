import { extendType, objectType, nonNull, stringArg, idArg, nullable } from "nexus";
import { NexusGenObjects } from "../../nexus-typegen";

export const Link = objectType({
  name: "Link",
  definition(t) {
    t.nonNull.id("id");
    t.nonNull.string("description");
    t.nonNull.string("url");
  },
});

let links: NexusGenObjects["Link"][] = [
  {
    id: "1",
    url: "www.howtographql.com",
    description: "Fullstack tutorial for GraphQL",
  },
  {
    id: "2",
    url: "www.google.com",
    description: "Google",
  },
];

export const LinkQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.nonNull.field("feed", {
      type: "Link",
      resolve: (parent, args, context, info) => {
        return links;
      }
    })
    t.nullable.field("link", {
      type: "Link",
      args: {
        id: nonNull(idArg()),
      },
      resolve: (parent, args, context, info) => {
        return links.find(link => link.id === args.id) ?? null
      }
    })
  },
});

export const LinkMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.nonNull.field("post", {
      type: "Link",
      args: {
        description: nonNull(stringArg()),
        url: nonNull(stringArg()),
      },
      resolve: (parent, args, context, info) => {
        const { description, url} = args;
        let idCount = links.length + 1;
        const link = {
          id: idCount.toString(),
          description,
          url,
        };
        links.push(link);
        return link;
      }
    })
    t.nonNull.field("updateLink", {
      type: "Link",
      args: {
        id: nonNull(idArg()),
        description: nullable(stringArg()),
        url: nullable(stringArg()),
      },
      resolve: (parent, args, context, info) => {
        let link = links.find(link => link.id === args.id);
        if (!link) {
          throw new Error("Link not found");
        }
        link.description = args.description ?? link.description;
        link.url = args.url ?? link.url;
        return link;
      }
    })
    t.nonNull.field("deleteLink", {
      type: "Link",
      args: {
        id: nonNull(idArg()),
      },
      resolve: (parent, args, context, info) => {
        let link = links.find(link => link.id === args.id);
        if (!link) {
          throw new Error("Link not found");
        }
        links = links.filter(link => link.id !== args.id);
        return link;
      }
    })
  },
});