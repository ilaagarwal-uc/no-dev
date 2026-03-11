OUTPUT_PATH = '/tmp/2f4017d4-ef1b-49a7-a74d-169ab7f4ce9c.glb'

import bpy

def create_wall_skeleton():
    # Clear existing objects in the scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Conversion factor from feet to meters
    ft_to_m = 0.3048

    # Wall dimensions (Total width = 7' + 7'6" = 14.5', Height = 9')
    wall_width = 14.5 * ft_to_m
    wall_height = 9.0 * ft_to_m
    wall_thickness = 0.5 * ft_to_m  # Standard wall thickness assumption

    # Opening dimensions (Width = 7', Height = 8')
    opening_width = 7.0 * ft_to_m
    opening_height = 8.0 * ft_to_m

    # Create the main wall
    bpy.ops.mesh.primitive_cube_add(size=1)
    wall = bpy.context.active_object
    wall.name = "MainWall"
    wall.scale = (wall_width, wall_thickness, wall_height)
    # Position wall so bottom-left-front is at origin (roughly)
    wall.location = (wall_width / 2, 0, wall_height / 2)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    # Create the opening (Door/AC area)
    bpy.ops.mesh.primitive_cube_add(size=1)
    opening = bpy.context.active_object
    opening.name = "Opening"
    # Make opening slightly thicker to ensure clean boolean cut
    opening.scale = (opening_width, wall_thickness * 2, opening_height)
    # Position opening at the bottom left of the wall
    opening.location = (opening_width / 2, 0, opening_height / 2)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    # Apply Boolean modifier to the wall
    bool_mod = wall.modifiers.new(name="OpeningCut", type='BOOLEAN')
    bool_mod.object = opening
    bool_mod.operation = 'DIFFERENCE'
    
    bpy.context.view_layer.objects.active = wall
    bpy.ops.object.modifier_apply(modifier=bool_mod.name)

    # Remove the opening helper object
    bpy.data.objects.remove(opening, do_unlink=True)

    # Export to GLB
    output_path = "wall_skeleton.glb"
    bpy.ops.export_scene.gltf(
        filepath=output_path,
        export_format='GLB',
        use_selection=False
    )

create_wall_skeleton()