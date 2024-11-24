import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import fetch from "node-fetch";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const url = "https://sghr2bbz.filter.evo-shield.com/players.json";
let lastOnlineTime = null;
let totalUptimeSeconds = 0;
let isServerOnline = false;

client.on("ready", () => {
  console.log(`BOT ${client.user.tag} Đã Online`);

  setInterval(async () => {
    try {
      // Thêm agent proxy vào fetch
      // const entry = await fetch(url).then((data) => {
      //   if (!data.ok) {
      //     throw new Error(`HTTP Error: ${data.status}`);
      //   }
      //   return data.json;
      // });
      const entry = await fetch(url)
        .then((response) => response.json())
        .catch((err) => console.error("Fetch error:", err));
      // if (!response.ok) {
      //   throw new Error(`HTTP Error: ${response.status}`);
      // }

      // const entry = await response.json();
      let slca = 0,
        slmed = 0,
        slch = 0;

      for (let player of entry) {
        let name = player.name.toLowerCase().trim();
        if (
          name.startsWith("ca") ||
          name.startsWith("s.w.a.t") ||
          name.startsWith("gđca") ||
          name.startsWith("quân y") ||
          name.startsWith("pgdca") ||
          name.startsWith("qlca")
        ) {
          slca++;
        } else if (
          name.startsWith("sos") ||
          name.startsWith("gđss") ||
          name.startsWith("pgdss") ||
          name.startsWith("qlss")
        ) {
          slmed++;
        } else if (
          name.startsWith("ch") ||
          name.startsWith("gđch") ||
          name.startsWith("pgdch") ||
          name.startsWith("qlch") ||
          name.startsWith("tkch")
        ) {
          slch++;
        }
      }

      if (!isServerOnline) {
        lastOnlineTime = Date.now();
        isServerOnline = true;
      } else {
        totalUptimeSeconds = Math.floor((Date.now() - lastOnlineTime) / 1000);
      }

      let serverUptimeHours = Math.floor(totalUptimeSeconds / 3600);
      let serverUptimeMinutes = Math.floor((totalUptimeSeconds % 3600) / 60);

      client.user.setActivity(
        `AnF: ${entry.length} | 👮🏻: ${slca} 👨‍⚕️: ${slmed} 🔧: ${slch} | Uptime: ${serverUptimeHours}h ${serverUptimeMinutes}m`,
        { type: "PLAYING" }
      );
    } catch (error) {
      if (isServerOnline) {
        isServerOnline = false;
        totalUptimeSeconds = 0;
      }
      console.error("Error while fetching server data:", error.message);
      client.user.setActivity("Server Offline", { type: "PLAYING" });
    }
  }, 9000);
});

/////////////////////////////////////////////////////////////////////////////
const gangs = {};

client.on("ready", async () => {
  try {
    const commands = [
      new SlashCommandBuilder()
        .setName("addgangnhom")
        .setDescription("Thêm một nhóm gang vào hệ thống")
        .addStringOption((option) =>
          option
            .setName("nametaggangnhom")
            .setDescription("Tên của nhóm gang")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("nametaggangnhom2")
            .setDescription("Tên nhóm phụ")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("lenh")
            .setDescription("Lệnh kèm theo nhóm")
            .setRequired(true)
        ),
      new SlashCommandBuilder()
        .setName("delgangnhom")
        .setDescription("Xóa nhóm gang khỏi hệ thống")
        .addStringOption((option) =>
          option
            .setName("nametaggangnhom")
            .setDescription("Tên nhóm gang cần xóa")
            .setRequired(true)
        ),
    ];

    // Đăng ký các lệnh với Discord API
    await client.application.commands.set(commands);
    console.log("Slash commands đã được đăng ký thành công!");
  } catch (error) {
    console.error("Đăng ký lệnh Slash không thành công:", error);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  // Lệnh /addgangnhom để thêm nhóm và lệnh
  if (commandName === "addgangnhom") {
    const nametaggangnhom = options
      .getString("nametaggangnhom")
      .trim()
      .toLowerCase();
    const nametaggangnhom2 = options
      .getString("nametaggangnhom2")
      .trim()
      .toLowerCase();
    const nametaggangnhomOriginal = options.getString("nametaggangnhom").trim();
    const nametaggangnhom2Original = options
      .getString("nametaggangnhom2")
      .trim();
    const lệnh = options.getString("lenh").trim().toLowerCase();

    // Lưu nhóm và lệnh vào đối tượng gangs, kèm giá trị gốc
    gangs[lệnh] = {
      nametaggangnhom,
      nametaggangnhom2,
      nametaggangnhomOriginal,
      nametaggangnhom2Original,
    };

    await interaction.reply({
      content: `Đã thêm nhóm ${nametaggangnhomOriginal} và ${nametaggangnhom2Original} với lệnh ${lệnh}.`,
      ephemeral: true,
    });
  }

  // Lệnh /delgangnhom để xóa nhóm khỏi hệ thống
  if (commandName === "delgangnhom") {
    const nametaggangnhom = options
      .getString("nametaggangnhom")
      .trim()
      .toLowerCase();

    // Kiểm tra nếu nhóm tồn tại trong gangs
    const lệnh = Object.keys(gangs).find(
      (key) =>
        gangs[key].nametaggangnhom === nametaggangnhom ||
        gangs[key].nametaggangnhom2 === nametaggangnhom
    );

    if (lệnh) {
      const originalName =
        gangs[lệnh].nametaggangnhomOriginal || nametaggangnhom;
      // Xóa nhóm khỏi đối tượng gangs
      delete gangs[lệnh];
      await interaction.reply({
        content: `Đã xóa nhóm ${originalName} khỏi hệ thống.`,
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: `Không tìm thấy nhóm ${nametaggangnhom} trong hệ thống.`,
        ephemeral: true,
      });
    }
  }
});

client.on("messageCreate", async (message) => {
  const commandPrefix = "."; // Tiền tố cho lệnh

  if (message.content.startsWith(commandPrefix)) {
    const lệnh = message.content.substring(commandPrefix.length).trim();

    // Lệnh tính tổng số thành viên
    if (lệnh === "bb") {
      try {
        // Fetch dữ liệu từ API
        const response = await fetch(url);
        const body = await response.json();

        // Khởi tạo đối tượng để lưu tổng số thành viên
        const gangTotals = {};

        // Duyệt qua từng gang và tính tổng thành viên
        for (const gangKey in gangs) {
          const { nametaggangnhom, nametaggangnhom2 } = gangs[gangKey];
          let totalMembers = 0;

          body.forEach(({ name }) => {
            const normalizedName = name.trim().toLowerCase();
            if (normalizedName.includes(nametaggangnhom)) {
              totalMembers++;
            }
            if (normalizedName.includes(nametaggangnhom2)) {
              totalMembers++;
            }
          });

          gangTotals[gangKey] = totalMembers;
        }

        // Tạo embed để hiển thị tổng số thành viên
        const embed = new EmbedBuilder()
          .setColor("#42f5b3")
          .setTitle("**Tổng số thành viên các gang**")
          .setTimestamp()
          .setThumbnail(
            "https://images-ext-1.discordapp.net/external/-TJoSpJ5eO6va8TuFiUsrm52o5W76RRc5sGytmBgPdU/%3Fsize%3D4096/https/cdn.discordapp.com/icons/1207297527989407767/8630899888c470b3fffbc73e59d4dab7.png?format=webp&quality=lossless&width=662&height=662"
          )
          .setImage(
            "https://cdn.discordapp.com/attachments/697049699193978941/746691133660332092/divider_1.gif"
          )
          .setFooter({
            text: `Create by Tun`,
            iconURL:
              "https://images-ext-1.discordapp.net/external/-TJoSpJ5eO6va8TuFiUsrm52o5W76RRc5sGytmBgPdU/%3Fsize%3D4096/https/cdn.discordapp.com/icons/1207297527989407767/8630899888c470b3fffbc73e59d4dab7.png?format=webp&quality=lossless&width=662&height=662",
          });

        // Thêm thông tin tổng thành viên vào embed
        for (const gangKey in gangTotals) {
          const { nametaggangnhom, nametaggangnhom2 } = gangs[gangKey];
          const total = gangTotals[gangKey];

          embed.addFields({
            name: `${nametaggangnhom} + ${nametaggangnhom2}`,
            value: `<a:02b79dcb42c5418893e2a31c3b29c647:1217489397109358733> : **Tổng số thành viên gang đang online: ${total}**`,
            inline: false,
          });
        }

        // Gửi embed
        message.reply({ embeds: [embed] });
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        message.reply("Đã xảy ra lỗi khi truy xuất dữ liệu.");
      }
    }

    // Các lệnh khác (ví dụ: .lg, .paradise)
    if (gangs[lệnh]) {
      const {
        nametaggangnhom,
        nametaggangnhom2,
        nametaggangnhomOriginal,
        nametaggangnhom2Original,
      } = gangs[lệnh];

      try {
        // Fetch dữ liệu từ API
        const response = await fetch(url);
        const body = await response.json();

        // Khởi tạo danh sách thành viên và số lượng cho mỗi nametag
        let memberList1 = [];
        let memberList2 = [];
        let slMembers1 = 0;
        let slMembers2 = 0;

        body.forEach(({ name, id }) => {
          const normalizedName = name.trim().toLowerCase();

          // Kiểm tra với nametaggangnhom và nametaggangnhom2
          if (normalizedName.includes(nametaggangnhom.toLowerCase())) {
            slMembers1++;
            // Lấy tên thành viên sau dấu "|"
            const memberName = name.split("|").slice(-1)[0].trim(); // Tên sau dấu "|"
            memberList1.push(`**${slMembers1}. [ID: ${id}] => ${name}**`); // Hiển thị đầy đủ name (nametag)
          }
          if (normalizedName.includes(nametaggangnhom2.toLowerCase())) {
            slMembers2++;
            // Lấy tên thành viên sau dấu "|"
            const memberName = name.split("|").slice(-1)[0].trim(); // Tên sau dấu "|"
            memberList2.push(`**${slMembers2}. [ID: ${id}] => ${name}**`); // Hiển thị đầy đủ name (nametag)
          }
        });

        const createEmbed = () => {
          const embed = new EmbedBuilder()
            .setColor("#42f5b3")
            .setTitle(`Số lượng người online: ${body.length}`)
            .setAuthor({
              name: "Server Anf.",
              iconURL:
                "https://images-ext-1.discordapp.net/external/-TJoSpJ5eO6va8TuFiUsrm52o5W76RRc5sGytmBgPdU/%3Fsize%3D4096/https/cdn.discordapp.com/icons/1207297527989407767/8630899888c470b3fffbc73e59d4dab7.png?format=webp&quality=lossless&width=662&height=662",
            })
            .setThumbnail(
              "https://images-ext-1.discordapp.net/external/-TJoSpJ5eO6va8TuFiUsrm52o5W76RRc5sGytmBgPdU/%3Fsize%3D4096/https/cdn.discordapp.com/icons/1207297527989407767/8630899888c470b3fffbc73e59d4dab7.png?format=webp&quality=lossless&width=662&height=662"
            )
            .setImage(
              "https://cdn.discordapp.com/attachments/697049699193978941/746691133660332092/divider_1.gif"
            )
            .setTimestamp()
            .setFooter({
              text: "Create by Tun",
              iconURL:
                "https://images-ext-1.discordapp.net/external/-TJoSpJ5eO6va8TuFiUsrm52o5W76RRc5sGytmBgPdU/%3Fsize%3D4096/https/cdn.discordapp.com/icons/1207297527989407767/8630899888c470b3fffbc73e59d4dab7.png?format=webp&quality=lossless&width=662&height=662",
            });
          return embed;
        };

        const embed = createEmbed();

        // Kiểm tra và thêm thành viên vào embed nếu có
        if (memberList1.length > 0) {
          embed.addFields({
            name: nametaggangnhomOriginal,
            value: memberList1.join("\n"),
            inline: false,
          });
        } else {
          embed.addFields({
            name: nametaggangnhomOriginal,
            value: "Không có thành viên trong nhóm này.",
            inline: false,
          });
        }

        if (memberList2.length > 0) {
          embed.addFields({
            name: nametaggangnhom2Original,
            value: memberList2.join("\n"),
            inline: false,
          });
        } else {
          embed.addFields({
            name: nametaggangnhom2Original,
            value: "Không có thành viên trong nhóm này.",
            inline: false,
          });
        }

        message.reply({ embeds: [embed] });
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        message.reply("Đã xảy ra lỗi khi truy xuất dữ liệu.");
      }
    }
  }
});

// =================================================================================//

////////////////////////////////////////////////
client.on("messageCreate", async (message) => {
  const prefix = "";
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  // Kiểm tra xem người dùng có role 'boss' hay không
  let requiredRole = "☸️ Witch ☸️"; // Đặt tên role mà bạn muốn yêu cầu
  if (!message.member.roles.cache.some((role) => role.name === requiredRole)) {
    return; // Nếu không có role, không làm gì
  }

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // Ví dụ về một lệnh khác...
  if (command === "example") {
    message.reply("This is an example command.");
  }

  // Hàm chia danh sách kết quả thành các đoạn nhỏ hơn với giới hạn ký tự
  function splitResults(list, maxLength = 1024) {
    const chunks = [];
    let chunk = "";

    list.forEach((item) => {
      if ((chunk + item).length > maxLength) {
        chunks.push(chunk);
        chunk = ""; // Reset chunk
      }
      chunk += item + "\n";
    });

    if (chunk) chunks.push(chunk); // Thêm phần còn lại nếu có

    return chunks;
  }

  if (message.content.startsWith(".search")) {
    const args = message.content.split(" ").slice(1);
    const searchTerm = args.join(" ").trim().toLowerCase();

    if (!searchTerm) {
      return message.channel.send("Vui lòng nhập nametag bạn muốn tìm.");
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const body = await response.json();
      let entry = body;

      const results = entry.filter((player) =>
        player.name.toLowerCase().startsWith(searchTerm.slice(0, 4))
      );

      if (results.length > 0) {
        const resultStrings = results.map((player, index) => {
          return `[${index + 1}] [ID:${player.id}] ${player.name}`;
        });

        const resultChunks = splitResults(resultStrings);

        const baseEmbed = new EmbedBuilder()
          .setColor("#42f5b3")
          .setTitle(`Kết quả tìm kiếm cho "${searchTerm}"`)
          .setThumbnail(
            "https://media.discordapp.net/attachments/1068698576336732201/1166763925455503370/logo_chu_nen_trong_suot.png?ex=6732ced5&is=67317d55&hm=30a85216fb7f14107656833531d09ab4f39ac5b9ada20757574ec5fc4342547e&=&format=webp&quality=lossless&width=1008&height=662"
          )
          .setImage(
            "https://cdn.discordapp.com/attachments/697049699193978941/746691133660332092/divider_1.gif"
          )
          .setTimestamp()
          .setFooter({ text: "Created by Tun" });

        resultChunks.forEach((chunk, index) => {
          const embed = new EmbedBuilder(baseEmbed).setDescription(
            `Tổng số người tìm thấy: ${results.length}\n\n${chunk}`
          );
          message.channel.send({ embeds: [embed] });
        });
      } else {
        message.channel.send(
          `Không tìm thấy người nào với nametag bắt đầu bằng "${searchTerm.slice(
            0,
            4
          )}".`
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      message.channel.send("Đã xảy ra lỗi khi truy xuất dữ liệu từ server.");
    }
  }

  if (message.content === ".help") {
    // Tạo Embed với các lệnh
    const embed = new EmbedBuilder()
      .setColor("#42f5b3")
      .setTitle("Danh sách Lệnh BOT")
      .setDescription(
        "Dưới đây là các lệnh có sẵn để kiểm tra thông tin và thống kê:"
      )
      .addFields(
        {
          name: "Lệnh Check BOT",
          value: "+ Danh sách admin và mod , support server : `!infobot`",
        },
        { name: "Check số lượng online của server", value: "`uptime`" },
        { name: "Check IP Server", value: "`!ip` hoặc `.ip`" },
        {
          name: "Check link Steam, ID người chơi",
          value: "`.id x` (x là số id ingame)",
        },
        { name: "Hiện danh sách tên người chơi", value: "`!check`" },
        { name: "Check số lượng thành viên gangter: Bạch Ma", value: "`.bm`" },
        {
          name: "Check số lượng thành viên gangter: Cấm Thuật",
          value: "`.ct`",
        },
        { name: "Check số lượng thành viên gangter: Paradise", value: "`.pa`" },
        {
          name: "Check số lượng thành viên gangter: Brotherhood",
          value: "`.bh`",
        },
        { name: "Check số lượng thành viên gangter: Panther", value: "`.pt`" },
        {
          name: "Check số lượng thành viên gangter: Dinosaur",
          value: "`.dino`",
        },
        { name: "Check số lượng thành viên gangter: TiTans", value: "`.tt`" },
        { name: "Check Sos", value: "`.sos`" },
        { name: "Check Công An", value: "`.ca`" },
        {
          name: "Check số lượng thành viên gangter: Last Legend",
          value: "`!lg`",
        },
        { name: "Check số lượng thành viên gangter: Mutiny", value: "`.mn`" },
        { name: "Check Quân Y", value: "`.qy`" },
        { name: "Check Quân Y và CA", value: "`.caqy`" }
      )
      .setThumbnail(
        "https://media.discordapp.net/attachments/1068698576336732201/1166763925455503370/logo_chu_nen_trong_suot.png"
      )
      .setTimestamp()
      .setFooter({ text: "Created by Tun" });

    message.reply({ embeds: [embed] });
  }

  if (message.content === ".cache") {
    // Tạo một Embed cho hướng dẫn xóa cache FiveM
    const embed = new EmbedBuilder()
      .setColor("#0099FF")
      .setTitle("HƯỚNG DẪN XÓA CACHE FIVE M")
      .setDescription("Làm theo các bước dưới đây để xóa cache FiveM")
      .addFields(
        {
          name: "Bước 1",
          value: "Chuột phải vào FiveM và chọn **Open File Location**.",
        },
        {
          name: "Bước 2",
          value:
            "Chọn **FiveM Application Data** (Hình con ốc sên thường ở trên cùng).",
        },
        {
          name: "Bước 3",
          value:
            "Chọn vào thư mục **cache** -> **priv** -> xoá hết tất cả file trong đây, chỉ để lại 2 thư mục trên cùng (db và unconfirmed).",
        },
        {
          name: "Bước 4",
          value: "Khởi động lại **FiveM**.",
        },
        {
          name: "Link Download",
          value:
            "Có thể download file này về sẽ tự xóa (nên check virus tại [VirusTotal](https://www.virustotal.com))\n" +
            "[Tải File](https://drive.google.com/file/d/1wQ8SaUN4j--Nb9aA2TmAKewsGVky20nF/view?usp=sharing)",
        }
      )
      .setFooter({ text: "© Copyright by Tun" })
      .setTimestamp();

    // Gửi embed vào kênh
    await message.reply({ embeds: [embed] });
  }

  if (command == ".ip") {
    const exampleEmbed = new EmbedBuilder()
      .setColor("#ff7112")
      .setAuthor({ name: "Server Anf" })
      .setTitle("Hướng dẫn vào sever Anf.")
      .setThumbnail(
        "https://media.discordapp.net/attachments/1068698576336732201/1166763925455503370/logo_chu_nen_trong_suot.png?ex=6732ced5&is=67317d55&hm=30a85216fb7f14107656833531d09ab4f39ac5b9ada20757574ec5fc4342547e&=&format=webp&quality=lossless&width=1008&height=662"
      )
      .setTimestamp()
      .setImage(
        "https://cdn.discordapp.com/attachments/697049699193978941/746691133660332092/divider_1.gif"
      )
      .setFooter({
        text: "© Copyright by Tun  - Do not reup",
        iconURL:
          "https://media.discordapp.net/attachments/1068698576336732201/1166763925455503370/logo_chu_nen_trong_suot.png?ex=6732ced5&is=67317d55&hm=30a85216fb7f14107656833531d09ab4f39ac5b9ada20757574ec5fc4342547e&=&format=webp&quality=lossless&width=1008&height=662",
      })
      .addFields({
        name: "** **",
        value: "```yaml\n connect 86zggv \n connect anfcity.com```",
        inline: false,
      });

    message.channel.send({ embeds: [exampleEmbed] });
  }

  if (command === ".uptime") {
    try {
      const response = await fetch(url); // Fetch dữ liệu từ URL
      if (!response.ok) {
        throw new Error("Failed to fetch server data");
      }

      const entry = await response.json(); // Parse JSON từ response

      let slca = 0,
        slmed = 0,
        slch = 0;

      // Lặp qua các người chơi để phân loại
      for (let i = 0; i < entry.length; i++) {
        let b = entry[i]["name"];
        let name = b.toLowerCase().trim();

        // Nhóm CA
        if (
          name.startsWith("ca") ||
          name.startsWith("s.w.a.t") ||
          name.startsWith("swat") ||
          name.startsWith("quân y") ||
          name.startsWith("gđca") ||
          name.startsWith("pgdca") ||
          name.startsWith("qlca")
        ) {
          slca++;
        }
        // Nhóm SOS
        else if (
          name.startsWith("sos") ||
          name.startsWith("qlss") ||
          name.startsWith("gđss") ||
          name.startsWith("pgdss") ||
          name.startsWith("pgđss")
        ) {
          slmed++;
        }
      }

      // Tạo tin nhắn phản hồi cho Discord
      const exampleEmbed = new EmbedBuilder()
        .setColor("#ff7112")
        .setAuthor({ name: "Server Anf" })
        .setTitle("Anf.")
        .setThumbnail(
          "https://media.discordapp.net/attachments/1068698576336732201/1166763925455503370/logo_chu_nen_trong_suot.png?ex=6732ced5&is=67317d55&hm=30a85216fb7f14107656833531d09ab4f39ac5b9ada20757574ec5fc4342547e&=&format=webp&quality=lossless&width=1008&height=662&"
        )
        .setTimestamp()
        .setFooter({
          text: "© Copyright by Tun - Do not reup",
          iconURL:
            "https://media.discordapp.net/attachments/1068698576336732201/1166763925455503370/logo_chu_nen_trong_suot.png?ex=6732ced5&is=67317d55&hm=30a85216fb7f14107656833531d09ab4f39ac5b9ada20757574ec5fc4342547e&=&format=webp&quality=lossless&width=1008&height=662&",
        })
        .addFields(
          { name: "Developer:", value: "Tun", inline: true },
          { name: "Info server:", value: "Anf", inline: true },
          { name: "BOT Creator:", value: "Tun", inline: true },
          {
            name: "IP server:",
            value: "connect anfcity.com",
            inline: true,
          },
          {
            name: "IP server:",
            value: "connect 86zggv",
            inline: true,
          },
          {
            name: "**In Game:**",
            value: `\`\`\`yaml\nOnline: ${entry.length} | 👮🏻 CA: ${slca} 👨‍⚕️ SOS: ${slmed} 🔧 CH: ${slch}\`\`\``,
            inline: false,
          }
        );

      // Gửi tin nhắn đến kênh Discord
      message.channel.send({ embeds: [exampleEmbed] });
    } catch (error) {
      console.error(`Error: ${error.message}`);
      message.channel.send(
        "Error fetching server data. Please try again later."
      );
    }
  }

  if (command === ".id") {
    const args = message.content.trim().split(/\s+/); // Khai báo `args` trong if
    if (!args[1]) {
      return message.channel.send(
        `ID Không có ID tìm đầu buồi à, ${message.author}!`
      );
    }

    try {
      // Dùng fetch để lấy dữ liệu từ API
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch: ${response.status} ${response.statusText}`
        );
      }
      const entry = await response.json(); // Parse JSON từ response

      let found = false;
      for (let i = 0; i < entry.length; i++) {
        const b = entry[i]["id"];
        const identifiers = entry[i]["identifiers"];

        // Kiểm tra nếu identifiers tồn tại và có ít nhất 1 phần tử
        if (identifiers && identifiers.length > 0) {
          const c = identifiers[0].substr(6, 15); // Truy cập phần tử đầu tiên của identifiers
          const discordId = identifiers.find((id) => id.startsWith("discord"));

          // Kiểm tra nếu Discord identifier tồn tại
          let d;
          let contactLink = "Không có thông tin Discord.";
          if (discordId) {
            const userId = discordId.split(":")[1]; // Lấy ID sau 'discord:'
            d = `<@${userId}>`; // Tag người dùng bằng ID của họ
            contactLink = `[Contact](https://discord.com/users/${userId})`;
          } else {
            d = "Không có thông tin Discord.";
          }

          // So sánh ID từ API với ID người dùng yêu cầu
          if (String(b) === String(args[1])) {
            found = true;

            try {
              // Tiến hành gửi Embed nếu ID khớp
              const exampleEmbed = new EmbedBuilder()
                .setColor("#42f5b3")
                .setTitle("Tên Ingame: " + String(entry[i]["name"])) // Chuyển đổi sang chuỗi
                .setAuthor({ name: "Thông Tin Người Chơi:" })
                .setThumbnail(
                  "https://images-ext-1.discordapp.net/external/-TJoSpJ5eO6va8TuFiUsrm52o5W76RRc5sGytmBgPdU/%3Fsize%3D4096/https/cdn.discordapp.com/icons/1207297527989407767/8630899888c470b3fffbc73e59d4dab7.png?format=webp&quality=lossless&width=662&height=662"
                )
                .setImage(
                  "https://cdn.discordapp.com/attachments/697049699193978941/746691133660332092/divider_1.gif"
                )
                .setTimestamp()
                .setFooter({
                  text: "© Copyright by Tun",
                  iconURL:
                    "https://images-ext-1.discordapp.net/external/-TJoSpJ5eO6va8TuFiUsrm52o5W76RRc5sGytmBgPdU/%3Fsize%3D4096/https/cdn.discordapp.com/icons/1207297527989407767/8630899888c470b3fffbc73e59d4dab7.png?format=webp&quality=lossless&width=662&height=662",
                })
                .addFields(
                  { name: "+ ID Server:", value: String(entry[i]["id"]) }, // Chuyển đổi sang chuỗi
                  {
                    name: "+ Link Steam:",
                    value: "https://steamcommunity.com/profiles/" + String(c), // Chuyển đổi sang chuỗi
                  },
                  { name: "+ Discord:", value: d },
                  { name: "+ Nhấn Vào Đây Để Liên Hệ:", value: contactLink }
                );

              await message.channel.send({ embeds: [exampleEmbed] });
              return;
            } catch (err) {
              console.error("Lỗi khi gửi Embed:", err);
              message.channel.send("Lỗi khi gửi thông tin người chơi.");
            }
          }
        }
      }

      if (!found) {
        message.channel.send("Không tìm thấy người chơi với ID này.");
      }
    } catch (error) {
      console.error(`Error khi fetch dữ liệu từ API: ${error.message}`);
      message.channel.send("Có lỗi xảy ra khi lấy thông tin người chơi.");
    }
  }

  if (command === ".check") {
    // Removed the role check
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const entry = await response.json();
      console.log(entry.length);
      let slall = entry.length;

      function cach(maxcach, length) {
        let khoangcach = " ";
        return khoangcach.substring(0, maxcach - length);
      }

      let indexarr = 0;
      let resarrstr = [""];
      for (let i = 0; i < entry.length; i++) {
        let stt = i + 1;
        let ID =
          "[ID:" +
          entry[i]["id"] +
          "]" +
          cach(6, entry[i]["id"].toString().length);
        resarrstr[indexarr] += `\n#${
          stt + cach(5, stt.toString().length)
        }${ID}: ${entry[i]["name"]}`;
        if (resarrstr[indexarr].length > 900) resarrstr[++indexarr] = "";
      }

      for (let i = 0; i < resarrstr.length; i++) {
        const exampleEmbed = new EmbedBuilder()
          .setColor("#42f5b3")
          .setTitle("Số lượng người online: " + entry.length)
          .setAuthor({
            name: "Server Anf.",
            iconURL:
              "https://images-ext-1.discordapp.net/external/-TJoSpJ5eO6va8TuFiUsrm52o5W76RRc5sGytmBgPdU/%3Fsize%3D4096/https/cdn.discordapp.com/icons/1207297527989407767/8630899888c470b3fffbc73e59d4dab7.png?format=webp&quality=lossless&width=662&height=662",
          })
          .setThumbnail(
            "https://images-ext-1.discordapp.net/external/-TJoSpJ5eO6va8TuFiUsrm52o5W76RRc5sGytmBgPdU/%3Fsize%3D4096/https/cdn.discordapp.com/icons/1207297527989407767/8630899888c470b3fffbc73e59d4dab7.png?format=webp&quality=lossless&width=662&height=662"
          )
          .setImage(
            "https://cdn.discordapp.com/attachments/697049699193978941/746691133660332092/divider_1.gif?ex=670e50cf&is=670cff4f&hm=cc8183af99ab9c4fa9f3f5bd2b1cc13ce5d641fc7306d7aaec6d655ff3b0bfd4&"
          )
          .setTimestamp()
          .setFooter({
            text: "Create by Tun",
            iconURL:
              "https://images-ext-1.discordapp.net/external/-TJoSpJ5eO6va8TuFiUsrm52o5W76RRc5sGytmBgPdU/%3Fsize%3D4096/https/cdn.discordapp.com/icons/1207297527989407767/8630899888c470b3fffbc73e59d4dab7.png?format=webp&quality=lossless&width=662&height=662",
          })
          .addFields({
            name: `List Tìm Kiếm | Trang ${i + 1}/${resarrstr.length}`,
            value: "```fix\n" + resarrstr[i] + "```",
            inline: false,
          })
          .setTimestamp();

        await message.channel.send({ embeds: [exampleEmbed] });
      }
    } catch (error) {
      console.error("Lỗi khi fetch dữ liệu:", error);
      message.channel.send("Có lỗi xảy ra khi lấy thông tin từ API.");
    }
  }

  if (command === ".ca") {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      // const entry = await fetch(url)
      //   .then((response) => response.json())
      //   .catch((err) => console.error("Fetch error:", err));
      const entry = await response.json();
      console.log(entry.length);

      let slca = 0;
      let slqy = 0;
      let caList = []; // Danh sách CA
      let qyList = []; // Danh sách QY
      let managementList = []; // Danh sách Ban Quản Lí

      // Định nghĩa các điều kiện cho CA và QY
      const caConditions = [
        (name) => name.includes("Police"),
        (name) => name.startsWith("CS"),
        (name) => name.startsWith("Thanh Tra"),
        (name) => name.startsWith("CA"),
        (name) => name.includes("S.W.A.T"),
        (name) => name.startsWith("SWAT"),
        (name) => name.startsWith("CACĐ"),
        (name) => name.startsWith("QLCA"),
        (name) => name.startsWith("GĐCA"),
        (name) => name.startsWith("GDCA"),
        (name) => name.startsWith("PGĐCA"),
        (name) => name.startsWith("PGDCA"),
        (name) => name.startsWith("PGDCS"),
        (name) => name.startsWith("GĐCS"),
      ];

      const qyConditions = [
        (name) => name.toLowerCase().includes("quân y"),
        (name) => name.startsWith("Quân Y"),
        (name) => name.startsWith("Quân Y | Leader"),
        (name) => name.startsWith("GDSS"),
        (name) => name.startsWith("GĐSS"),
        (name) => name.startsWith("QLSS"),
        (name) => name.startsWith("PGDSS"),
        (name) => name.startsWith("PGĐSS"),
      ];

      const managementConditions = [
        (name) => name.toLowerCase().includes("gđca"),
        (name) => name.toLowerCase().includes("pgđca"),
        (name) => name.toLowerCase().includes("qlca"),
      ];

      // Phân loại thành viên
      entry.forEach(({ name, id }) => {
        if (caConditions.some((condition) => condition(name))) {
          slca++;
          caList.push(`${slca}. [ID: ${id}] ==> ${name}`);
        }

        if (qyConditions.some((condition) => condition(name))) {
          slqy++;
          qyList.push(`${slqy}. [ID: ${id}] ==> ${name}`);
        }

        if (managementConditions.some((condition) => condition(name))) {
          managementList.push(`[ID: ${id}] ==> ${name}`);
        }
      });

      const slcaqy = slqy + slca;

      // Tạo embed ban đầu
      const createEmbed = (page, totalPages) => {
        const embed = new EmbedBuilder()
          .setColor("#42f5b3")
          .setTitle("Số lượng người online: " + entry.length)
          .setAuthor({
            name: "Server Anf.",
            iconURL:
              "https://images-ext-1.discordapp.net/external/-TJoSpJ5eO6va8TuFiUsrm52o5W76RRc5sGytmBgPdU/%3Fsize%3D4096/https/cdn.discordapp.com/icons/1207297527989407767/8630899888c470b3fffbc73e59d4dab7.png?format=webp&quality=lossless&width=662&height=662",
          })
          .setThumbnail(
            "https://images-ext-1.discordapp.net/external/-TJoSpJ5eO6va8TuFiUsrm52o5W76RRc5sGytmBgPdU/%3Fsize%3D4096/https/cdn.discordapp.com/icons/1207297527989407767/8630899888c470b3fffbc73e59d4dab7.png?format=webp&quality=lossless&width=662&height=662"
          )
          .setImage(
            "https://cdn.discordapp.com/attachments/697049699193978941/746691133660332092/divider_1.gif"
          )
          .setTimestamp()
          .setFooter({
            text: `Create by Tun - Trang ${page}/${totalPages}`,
            iconURL:
              "https://images-ext-1.discordapp.net/external/-TJoSpJ5eO6va8TuFiUsrm52o5W76RRc5sGytmBgPdU/%3Fsize%3D4096/https/cdn.discordapp.com/icons/1207297527989407767/8630899888c470b3fffbc73e59d4dab7.png?format=webp&quality=lossless&width=662&height=662",
          })
          .addFields({
            name: "Số lượng CA và QY đang online:",
            value: `**Công An: ${slca}**, **Quân Y: ${slqy}** \n**Tổng: ${slcaqy}**`,
            inline: false,
          });
        return embed;
      };

      // Hàm để thêm danh sách thành viên vào embed
      const addFieldsToEmbed = (embed, list, label) => {
        if (list.length === 0) {
          embed.addFields({
            name: label,
            value: "Không có ai online trong danh sách này.",
            inline: false,
          });
          return;
        }

        let chunk = "";
        let chunkCount = 0;
        const maxFieldChars = 1024;

        list.forEach((item) => {
          if ((chunk + item + "\n").length > maxFieldChars) {
            embed.addFields({
              name: `${label} (Phần ${++chunkCount}):`,
              value: chunk,
              inline: false,
            });
            chunk = item + "\n";
          } else {
            chunk += item + "\n";
          }
        });

        if (chunk) {
          embed.addFields({
            name: `${label} (Phần ${++chunkCount}):`,
            value: chunk,
            inline: false,
          });
        }
      };

      let currentPage = 1;
      const totalPages = 1;
      let embed = createEmbed(currentPage, totalPages);

      addFieldsToEmbed(embed, caList, "Danh Sách CA đang online");
      addFieldsToEmbed(embed, qyList, "Danh Sách QY đang online");
      addFieldsToEmbed(
        embed,
        managementList,
        "Danh Sách Ban Quản Lí đang online"
      );

      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error("Lỗi khi fetch dữ liệu:", error);
      message.channel.send("Có lỗi xảy ra khi lấy thông tin từ API.");
    }
  }

  if (command == ".qy") {
    fetch(url)
      .then((response) => response.json())
      .then((body) => {
        let entry = body;
        console.log(entry.length);

        let slqy = 0; // Số lượng Quân Y
        let qyList = []; // Danh sách Quân Y
        let slGroup = 0; // Số lượng nhóm GĐBS, PGĐBS, QLMED
        let groupList = []; // Danh sách nhóm

        // Danh sách tiền tố hợp lệ
        const qyPrefixes = ["QUÂN Y", "Quân y", "QY", "quân y", "Quân Y |"];
        const groupPrefixes = ["GĐSS", "PGĐSS", "QLSS", "GDSS", "PGDSS"];

        // Kiểm tra thành viên
        entry.forEach((member) => {
          const name = member["name"];
          const id = member["id"];

          // Kiểm tra Quân Y
          if (qyPrefixes.some((prefix) => name.startsWith(prefix))) {
            slqy++;
            qyList.push(` [ID: ${id}] ==> ${name}`);
          }

          // Kiểm tra nhóm GĐBS, PGĐBS, QLMED
          if (groupPrefixes.some((prefix) => name.startsWith(prefix))) {
            slGroup++;
            groupList.push(` [ID: ${id}] ==> ${name}`);
          }
        });

        // Tạo embed
        const exampleEmbed = new EmbedBuilder()
          .setColor("#42f5b3")
          .setAuthor({
            name: "Server Anf.",
            iconURL:
              "https://images-ext-1.discordapp.net/external/-TJoSpJ5eO6va8TuFiUsrm52o5W76RRc5sGytmBgPdU/%3Fsize%3D4096/https/cdn.discordapp.com/icons/1207297527989407767/8630899888c470b3fffbc73e59d4dab7.png?format=webp&quality=lossless&width=662&height=662",
          })
          .setThumbnail(
            "https://images-ext-1.discordapp.net/external/-TJoSpJ5eO6va8TuFiUsrm52o5W76RRc5sGytmBgPdU/%3Fsize%3D4096/https/cdn.discordapp.com/icons/1207297527989407767/8630899888c470b3fffbc73e59d4dab7.png?format=webp&quality=lossless&width=662&height=662"
          )
          .setImage(
            "https://cdn.discordapp.com/attachments/697049699193978941/746691133660332092/divider_1.gif"
          )
          .setTimestamp()
          .setFooter({
            text: "Create by Tun",
            iconURL:
              "https://images-ext-1.discordapp.net/external/-TJoSpJ5eO6va8TuFiUsrm52o5W76RRc5sGytmBgPdU/%3Fsize%3D4096/https/cdn.discordapp.com/icons/1207297527989407767/8630899888c470b3fffbc73e59d4dab7.png?format=webp&quality=lossless&width=662&height=662",
          })
          .addFields(
            {
              name: "Số lượng Quân Y đang online:",
              value: `Quân Y: ${slqy}`,
              inline: false,
            },
            {
              name: "Số lượng Ban Quản Lí đang online:",
              value: `Tổng: ${slGroup}`,
              inline: false,
            }
          );

        // Hàm để thêm danh sách thành viên và kiểm tra giới hạn ký tự
        const addFields = (list, label) => {
          if (list.length === 0) {
            exampleEmbed.addFields({
              name: label,
              value: "Không có ai online.",
              inline: false,
            });
            return;
          }

          let chunk = "";
          let chunkCount = 0;
          const maxFieldChars = 1024; // Giới hạn ký tự cho mỗi field
          const maxChunks = 25; // Giới hạn số lượng trường trong một embed

          for (const item of list) {
            // Kiểm tra chiều dài tổng cộng
            if (
              (chunk + item + "\n").length > maxFieldChars ||
              chunkCount >= maxChunks
            ) {
              exampleEmbed.addFields({
                name: `${label} (Phần ${++chunkCount}):`,
                value: chunk,
                inline: false,
              });
              chunk = item + "\n"; // Bắt đầu phần mới với item hiện tại
            } else {
              chunk += item + "\n"; // Thêm item vào phần hiện tại
            }
          }

          // Thêm phần còn lại nếu có
          if (chunk) {
            exampleEmbed.addFields({
              name: `${label} (Phần ${++chunkCount}):`,
              value: chunk,
              inline: false,
            });
          }
        };

        // Gọi hàm để thêm các trường
        addFields(qyList, "Danh Sách Quân Y đang online");
        addFields(groupList, "Danh Sách Ban Quản Lí đang online");

        // Gửi embed
        message.channel.send({ embeds: [exampleEmbed] }).catch((err) => {
          console.error("Error sending message:", err);
          if (err.code === 50035) {
            console.log("Nội dung tin nhắn hoặc embed vượt quá giới hạn.");
          }
        });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }

  if (command === ".sos") {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const entry = await response.json();
      console.log(entry.length);

      let slSos = 0;
      let slQy = 0;
      let sosList = []; // Danh sách SOS
      let qyList = []; // Danh sách Quân Y
      let managementList = []; // Danh sách Ban Quản Lí

      // Định nghĩa các điều kiện cho SOS, Quân Y và Ban Quản Lí
      const sosConditions = [(name) => name.includes("SOS")];

      const qyConditions = [
        (name) => name.startsWith("GĐSS"),
        (name) => name.startsWith("PGĐSS"),
        (name) => name.startsWith("QLSS"),
        (name) => name.startsWith("GDSS"),
        (name) => name.startsWith("PGDSS"),
      ];

      // Chỉ giữ lại những điều kiện cho Ban Quản Lí mà bạn muốn (bỏ GĐCA, QLCA, PGĐCA)
      const managementConditions = [
        (name) => name.toLowerCase().includes("bql"), // Ví dụ điều kiện cho Ban Quản Lí
      ];

      // Phân loại thành viên
      entry.forEach(({ name, id }) => {
        if (sosConditions.some((condition) => condition(name))) {
          slSos++;
          sosList.push(`${slSos}. [ID: ${id}] ==> ${name}`);
        }

        if (qyConditions.some((condition) => condition(name))) {
          slQy++;
          qyList.push(`${slQy}. [ID: ${id}] ==> ${name}`);
        }

        if (managementConditions.some((condition) => condition(name))) {
          managementList.push(`[ID: ${id}] ==> ${name}`);
        }
      });

      const totalSosAndQy = slQy + slSos;

      // Tạo embed ban đầu
      const createEmbed = (page, totalPages) => {
        const embed = new EmbedBuilder()
          .setColor("#42f5b3")
          .setTitle("Số lượng người online: " + entry.length)
          .setAuthor({
            name: "Server Anf.",
            iconURL:
              "https://images-ext-1.discordapp.net/external/-TJoSpJ5eO6va8TuFiUsrm52o5W76RRc5sGytmBgPdU/%3Fsize%3D4096/https/cdn.discordapp.com/icons/1207297527989407767/8630899888c470b3fffbc73e59d4dab7.png?format=webp&quality=lossless&width=662&height=662",
          })
          .setThumbnail(
            "https://images-ext-1.discordapp.net/external/-TJoSpJ5eO6va8TuFiUsrm52o5W76RRc5sGytmBgPdU/%3Fsize%3D4096/https/cdn.discordapp.com/icons/1207297527989407767/8630899888c470b3fffbc73e59d4dab7.png?format=webp&quality=lossless&width=662&height=662"
          )
          .setImage(
            "https://cdn.discordapp.com/attachments/697049699193978941/746691133660332092/divider_1.gif"
          )
          .setTimestamp()
          .setFooter({
            text: `Create by Tun - Trang ${page}/${totalPages}`,
            iconURL:
              "https://images-ext-1.discordapp.net/external/-TJoSpJ5eO6va8TuFiUsrm52o5W76RRc5sGytmBgPdU/%3Fsize%3D4096/https/cdn.discordapp.com/icons/1207297527989407767/8630899888c470b3fffbc73e59d4dab7.png?format=webp&quality=lossless&width=662&height=662",
          })
          .addFields({
            name: "Số lượng SOS và Quân Y đang online:",
            value: `**SOS: ${slSos}**, **Quân Y: ${slQy}** \n**Tổng: ${totalSosAndQy}**`,
            inline: false,
          });
        return embed;
      };

      // Hàm để thêm danh sách thành viên vào embed
      const addFieldsToEmbed = (embed, list, label) => {
        if (list.length === 0) {
          embed.addFields({
            name: label,
            value: "Không có ai online trong danh sách này.",
            inline: false,
          });
          return;
        }

        let chunk = "";
        let chunkCount = 0;
        const maxFieldChars = 1024;

        list.forEach((item) => {
          if ((chunk + item + "\n").length > maxFieldChars) {
            embed.addFields({
              name: `${label} (Phần ${++chunkCount}):`,
              value: chunk,
              inline: false,
            });
            chunk = item + "\n";
          } else {
            chunk += item + "\n";
          }
        });

        if (chunk) {
          embed.addFields({
            name: `${label} (Phần ${++chunkCount}):`,
            value: chunk,
            inline: false,
          });
        }
      };

      let currentPage = 1;
      const totalPages = 1;
      let embed = createEmbed(currentPage, totalPages);

      addFieldsToEmbed(embed, sosList, "Danh Sách SOS đang online");
      addFieldsToEmbed(embed, qyList, "Danh Sách Quân Y đang online");
      addFieldsToEmbed(
        embed,
        managementList,
        "Danh Sách Ban Quản Lí đang online"
      );

      message.channel.send({ embeds: [embed] });
    } catch (error) {
      console.error("Lỗi khi fetch dữ liệu:", error);
      message.channel.send("Có lỗi xảy ra khi lấy thông tin từ API.");
    }
  }
});

// Đăng nhập bot
client.login(
  "MTMwNjYyMjQ5MDI4NTU3NjIwMg.G5bO6e.yQ_daudikjY33dKK-K8uit8d-kLh4Pp7V4yRzQ"
);
