import { extendType, objectType, nonNull, stringArg, idArg, nullable } from "nexus";
import { NexusGenObjects } from "../../nexus-typegen";

export const Link = objectType({
  name: "Link",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("description");
    t.nonNull.string("url");
    // t.nonNull.dateTime("createdAt");
  },
});

export const LinkQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.nonNull.field("feed", {
      type: "Link",
      resolve: (parent, args, context, info) => {
        return context.prisma.link.findMany();
      }
    })
    t.nullable.field("link", {
      type: "Link",
      args: {
        id: nonNull(idArg()),
      },
      resolve: (parent, args, context, info) => {
        return context.prisma.link.findUnique({
          where: { id: Number(args.id) },
        });
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
        const newLink = context.prisma.link.create({
          data: {
            description: args.description,
            url: args.url,
          },
        });
        return newLink;
      }
    })
    t.nonNull.field("updateLink", {
      type: "Link",
      args: {
        id: nonNull(idArg()),
        description: nonNull(stringArg()),
        url: nonNull(stringArg()),
      },
      resolve: (parent, args, context, info) => {
        const link = context.prisma.link.update({
          where: { id: Number(args.id) },
          data: {
            description: args.description,
            url: args.url,
          },
        });
        return link;
      }
    })
    t.nonNull.field("deleteLink", {
      type: "Link",
      args: {
        id: nonNull(idArg()),
      },
      resolve: (parent, args, context, info) => {
        const link = context.prisma.link.delete({
          where: { id: Number(args.id) },
        });
        return link;
      }
    })
  },
});